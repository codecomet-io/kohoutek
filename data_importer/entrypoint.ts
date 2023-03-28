import {Tracer} from "./dependencies/ts-core/sentry.js"
import { createId } from './lib/helper.js';
import { BuffIngester } from "./lib/ingester.js";
import {
    AddFileAction,
    UtilityBuildAction,
    UtilityAction,
    FilesetBuildAction,
    FilesetAction,
    FilesetType,
    Action,
    BuildAction,
    BuildActionsObject,
    MergeAction,
    MakeDirectoryAction,
    MoveAction,
    PatchAction,
    ParentAction,
    BuildPipeline,
    Pipeline,
    CreateSymbolicLinkAction,
    UserAction,
    UserBuildAction,
    TimingInfo,
    AssembledLog,
    GroupedLogs,
    ParsedLog,
    MakeDirectoryBuildAction,
    MoveBuildAction,
    AddFileBuildAction,
    PatchBuildAction,
    CreateSymbolicLinkBuildAction,
    MergeBuildAction,
} from "./lib/model.js";
import {stdin} from "node:process";
import {bool, error, nil} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import {ReadFromIMPL} from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import {Protobuf} from "codecomet-js/source/utils/protobuf.js";
import { digest as CryptoDigest } from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import {readFileSync, writeFileSync} from "fs";
import {description} from "codecomet-js/experimental/protoc/github.com/gogo/protobuf/gogoproto/gogo_pb.js";
import { LocalVariables } from "@sentry/node/types/integrations/localvariables.js";

// Init Sentry
new Tracer("https://c02314800c4d4be2a32f1d28c4220f3f@o1370052.ingest.sentry.io/6673370")


type Meta = {
    id: string
    description: string
    commit: string // "651a7ef66b7277f7c293dee8aec6e38305b03022",
    author: string // "spacedub",
    parent: string // "c2356d03e4bb824ef898808cf558fc75615beddb",
    dirty: bool // true,
    location: string // "github.com/codecomet-io/reporter-elastic",
}

type LowLevelBuilderOperation = {
    operation: Types.Op
    digest: CryptoDigest.Digest
    metadata: Types.OpMetadata
}


const actionTypeMap = {
    'atomic.mv' : 'move',
    'atomic.addfile' : 'addFile',
    'atomic.mkdir' : 'makeDirectory',
    'atomic.patch' : 'patch',
    'atomic.symlink' : 'createSymbolicLink',
    'atomic.merge' : 'merge',
};


function ingest(buffer: Buffer): [ LowLevelBuilderOperation[], error ] {
    const [def, err] = ReadFromIMPL(buffer)

    if (err != nil) {
        return [nil, err]
    }

    const operations : LowLevelBuilderOperation[] = def.Def.map((dt) => {
        const digest = CryptoDigest.FromBytes(dt)

        return {
            digest,
            operation: <Types.Op>Protobuf.read("Op", dt),
            metadata: def.Metadata[digest],
        }
    })

    return [ operations, nil ]
}

export default async function Pantry(buffer: Buffer, trace: Buffer, meta: string): Promise<Pipeline> {
    await CodeComet.Bootstrap()

    // Spoof in metadata
    const metadata = <Meta>JSON.parse(meta);

    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    const [ llbOperations, err ] = ingest(buffer);

    const buildActionsObject: BuildActionsObject = {}

    const filesetDockerImageUrlRegex : RegExp = /^docker-image:/

    llbOperations.forEach((llbOperation) => {
        const name : string = llbOperation.metadata.description?.['llb.customname']
        const actionTypeKey : string = llbOperation?.metadata?.description?.['codecomet.op']

        if (
            llbOperation.metadata.caps['source.image']
            || llbOperation.metadata.caps['source.git']
            || llbOperation.metadata.caps['source.local']
            || llbOperation.metadata.caps['source.http']
        ) {
            let fileset = <FilesetBuildAction>{
                name,
                type: 'fileset',
                filesetType : FilesetType.Scratch,
                source: llbOperation.operation.source.identifier,
            }

            if (llbOperation.metadata.caps['source.image']) {
                fileset = {
                    ...fileset,
                    filesetType : FilesetType.Image,
                    forceResolve: llbOperation.operation.source.attrs['image.resolvemode'] === 'pull',
                    architecture: llbOperation.operation.platform.Architecture,
                    variant: llbOperation.operation.platform.Variant,
                }

                if (filesetDockerImageUrlRegex.test(fileset.source)) {
                    // By default, just replace the scheme with https for any docker image
                    let link = fileset.source.replace(filesetDockerImageUrlRegex, 'https:')

                    const url = new URL(fileset.source)

                    // If it is a Docker Hub image though, tranform it into http://hub.docker.com/r/OWNER/NAME
                    if (/docker\.io$/.test(url.hostname)) {
                        link = 'https://hub.docker.com/r' + url.pathname.replace(/:[^:]+$/, '')
                    }

                    // More special cases may be added in the future if need be (GHCR, ECR, etc)
                    fileset.link = link
                }
            } else if (llbOperation.metadata.caps['source.git']) {
                fileset = {
                    ...fileset,
                    filesetType : FilesetType.Git,
                    keepDir: llbOperation.operation.source.attrs['git.keepgitdir'] === 'true',
                    link: fileset.source.replace(/^git:/, 'https:'),
                }
            } else if (llbOperation.metadata.caps['source.local']) {
                fileset = {
                    ...fileset,
                    filesetType : FilesetType.Local,
                    excludePattern: JSON.parse(llbOperation.operation.source.attrs['local.excludepattern'] || '[]'),
                    includePattern: JSON.parse(llbOperation.operation.source.attrs['local.includepattern'] || '[]'),
                }
            } else if (llbOperation.metadata.caps['source.http']) {
                fileset = {
                    ...fileset,
                    filesetType : FilesetType.HTTP,
                    checksum: llbOperation.operation.source.attrs['http.checksum'],
                    filename: llbOperation.operation.source.attrs['http.filename'],
                    link: fileset.source,
                }
            }

            buildActionsObject[llbOperation.digest] = fileset
        } else if (actionTypeKey) {
            let descriptor: UtilityBuildAction

            switch (actionTypeKey) {
                case 'atomic.mkdir':
                    descriptor = <MakeDirectoryBuildAction>{
                        utilityName: 'make directory',
                    }

                    break
                case 'atomic.mv':
                    descriptor = <MoveBuildAction>{
                        utilityName: 'move',
                    }

                    break
                case 'atomic.addfile':
                    descriptor = <AddFileBuildAction>{
                        utilityName: 'add file',
                    }

                    break
                case 'atomic.patch':
                    descriptor = <PatchBuildAction>{
                        utilityName: 'patch',
                    }

                    break
                case 'atomic.symlink':
                    descriptor = <CreateSymbolicLinkBuildAction>{
                        utilityName: 'create symbolic link',
                    }

                    break
                case 'atomic.merge':
                    descriptor = <MergeBuildAction>{
                        utilityName: 'merge',
                    }

                    break
                default:
                    console.warn(`Unrecognized atomic action type|${actionTypeKey }|`)

                    descriptor = <UtilityBuildAction>{}
                    break
            }

            descriptor.type = actionTypeMap[ actionTypeKey ] ?? 'utility'
            descriptor.name = name

            buildActionsObject[llbOperation.digest] = descriptor
        } else {
            buildActionsObject[llbOperation.digest] = <UserBuildAction>{
                type: 'custom',
                name: name ?? '',
            }
        }
    })

    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: BuildPipeline, tsks: BuildActionsObject){
    const buffIngester = new BuffIngester()
    const buildPipeline : BuildPipeline = buffIngester.ingest(trace)
    //    , function(pl: BuildPipeline, tsks: BuildActionsObject){
    // XXX piggyback on metadata
    buildPipeline.id = metadata.id
    buildPipeline.description = metadata.description

    // disable repository output for now
    // it leaks info and isn't currently needed
    // buildPipeline.repository.commit = metadata.commit
    // buildPipeline.repository.author = metadata.author
    // buildPipeline.repository.parent = metadata.parent
    // buildPipeline.repository.dirty = metadata.dirty
    // buildPipeline.repository.location = metadata.location

    // Geez this is shit. @spacedub burn all of this with fire and rewrite the stitching probably (later...)
    // briznad: @spacedub you're too hard on yourself
    for (const [ digest, traceObject ] of Object.entries(buildPipeline.actionsObject)) {
        let typedObject: BuildAction

        if (buildActionsObject[digest]) {
            typedObject = buildActionsObject[digest]
        } else {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            for (const key of Object.keys(buildActionsObject)) {
                if (buildActionsObject[key]?.name === buildPipeline.actionsObject[digest]?.name) {
                    typedObject = buildActionsObject[key]

                    break
                }
            }

            if (!typedObject){
                console.warn("Unable to find proto object for vertex", digest)
                continue
            }
        }

        typedObject.id = traceObject.id
        typedObject.name = traceObject.name
        typedObject.cached = traceObject.cached
        typedObject.error = traceObject.error
        typedObject.digest = traceObject.digest
        typedObject.completed = traceObject.completed
        typedObject.started = traceObject.started
        typedObject.runtime = traceObject.runtime
        typedObject.status = traceObject.status
        typedObject.buildParents = traceObject.buildParents
        typedObject.assembledLogs = traceObject.assembledLogs

        buildPipeline.actionsObject[digest] = typedObject
    }

    const actionsOrder : string[] = Object.keys(buildPipeline.actionsObject)
        .sort((a, b) => // sort values chronologically, based on start time
            buildPipeline.actionsObject[a]?.started - buildPipeline.actionsObject[b]?.started
        )

    // after initial chronological sort, run an additional check to insure no parent action comes after a child
    outermostLoop: while (true) {
        for (const key of actionsOrder) {
            const parents = buildPipeline.actionsObject[key]?.buildParents

            if (!(parents && parents.length)) {
                continue
            }

            const itemIndex = actionsOrder.indexOf(key)

            for (const parent of parents) {
                const parentIndex = actionsOrder.indexOf(parent)

                if (parentIndex > itemIndex) {
                    console.info(
                        `item ${ key } appears before parent ${ parent }`,
                        `\ninserting item #${ itemIndex } after parent #${ parentIndex }`,
                        '\n',
                    )

                    actionsOrder.splice(parentIndex, 0, ...actionsOrder.splice(itemIndex, 1))

                    continue outermostLoop
                }
            }
        }

        break
    }

    const timingInfo : TimingInfo[] = []
    const filesets : FilesetAction[] = []
    const actions : Action[] = []

    for (const key of actionsOrder) {
        const item : any = buildPipeline.actionsObject[key]

        if (item.runtime != null) {
            timingInfo.push(parseActionTiming(item))
        }

        if (item.assembledLogs && item.assembledLogs.length > 0) {
            item.groupedLogs = parseGroupedLogs(item.assembledLogs)
        }

        delete item.assembledLogs

        if (item.type === 'fileset') {
            filesets.push(<FilesetAction>item)
        } else {
            let parents : ParentAction[] = []

            if (item.buildParents) {
                for (const digest of item.buildParents) {
                    if (!buildPipeline.actionsObject[digest]) {
                        continue
                    }

                    // insert the entry into the parents list at the same index as the parent in the overall list
                    // this insures the correct order
                    parents[actionsOrder.indexOf(digest)] = {
                        id : buildPipeline.actionsObject[digest].id,
                        name : buildPipeline.actionsObject[digest].name,
                    }
                }
            }

            // eliminate empty entries that may have resulted from inserting arbitrary index values
            parents = parents.filter((item) => item)

            if (!parents.length) {
                parents = null
            }

            delete item.buildParents

            actions.push(<Action>{
                ...item,
                parents,
            })
        }
    }

    delete buildPipeline.actionsObject

    const summedTimingRuntime : number = timingInfo.reduce(
        (sum, item) => sum + item.runtime,
        0,
    )

    for (const item of timingInfo) {
        // calculate percent of total runtime, rounded to 3 decimal places
        item.percent = Math.round(item.runtime / summedTimingRuntime * 100 * 1000) / 1000
    }

    return {
        ...buildPipeline,
        timingInfo,
        filesets,
        actions,
    }
}

function parseActionTiming(item : any) : TimingInfo {
    const { id, runtime } = item

    const name : string = item.type === 'fileset'
        ? `${ (item as unknown as FilesetAction).filesetType } fileset: ${ item.name }`
        : `action: ${ item.name }`

    const timingInfo : TimingInfo = {
        id,
        name,
        runtime,
        percent: 0,
    }

    if (item.status === 'cached') {
        timingInfo.cached = true
    }

    return timingInfo
}

function parseGroupedLogs(assembledLogs : AssembledLog[]) : GroupedLogs[] {
    const splitLines = (multiLineStr : string) : string[] => multiLineStr.split(/\r|\n/)

    const groupedLogs : GroupedLogs[] = []

    let lastCommand : string

    for (const assembledLog of assembledLogs) {
        const { command, resolved, exitCode } = assembledLog

        const logs : ParsedLog[] = []

        if (assembledLog.stdout) {
            logs.push({
                timestamp : assembledLog.timestamp,
                lines : splitLines(assembledLog.stdout),
            })
        }

        if (assembledLog.stderr) {
            logs.push({
                timestamp : assembledLog.timestamp,
                lines : splitLines(assembledLog.stderr),
                isStderr : true,
            })
        }

        if (command === lastCommand) {
            const item = groupedLogs[groupedLogs.length - 1]

            item.exitCode = exitCode

            item.logs.push(...logs)
        } else {
            groupedLogs.push({
                command,
                resolved,
                exitCode,
                logs,
                id : createId('html'),
            })
        }

        lastCommand = command
    }

    return groupedLogs
}


async function run(protoPath: string, tracePath: string, meta: string, destination: string) {
    // Retrieve the protobuf definition and the trace file from wherever they are (XHR, file)
    // Here, just lazily readfilesync them
    let buff = readFileSync(protoPath)
    let trace = readFileSync(tracePath)

    // Get the pipeline and the tasks from Pantry
    let pipeline = await Pantry(buff, trace, meta)

    if (pipeline == null) {
        console.error(`\nERROR: pipeline "${ destination.replace(/^.+\//, '') }" could not be retrieved and/or generated\n`)

        return
    }

    writeFileSync(destination, JSON.stringify(pipeline, null, 2))
}

run(
    process.argv[2],
    process.argv[3],
    process.argv[4],
    process.argv[5]
)
