import {Tracer} from "./dependencies/ts-core/sentry.js"
import {StdinIngester, BuffIngester} from "./lib/ingester.js";
import {
    AddFileAction,
    UtilityAction,
    Fileset,
    FilesetType,
    Action,
    ActionsObject,
    GitFileset,
    HTTPFileset,
    ImageFileset,
    LocalFileset,
    MergeAction,
    PrepareFilesetAction,
    MakeDirectoryAction,
    MoveAction,
    PatchAction,
    BuildPipeline,
    Pipeline,
    CreateSymbolicLinkAction,
    UserAction
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

    const filesets: Fileset[] = []
    const protoActions: ActionsObject = {}

    llbOperations.forEach((llbOperation) => {
        const name : string = llbOperation.metadata.description?.['llb.customname']
        const actionTypeKey : string = llbOperation?.metadata?.description?.['codecomet.op']

        if (
            llbOperation.metadata.caps['source.image']
            || llbOperation.metadata.caps['source.git']
            || llbOperation.metadata.caps['source.local']
            || llbOperation.metadata.caps['source.http']
        ) {
            let type = FilesetType.Scratch

            let fileset : Fileset = {
                name,
                type,
                id: 'tempNonUniqueFilesetId',
                source: llbOperation.operation.source.identifier,
            }

            if (llbOperation.metadata.caps['source.image']) {
                type = FilesetType.Image

                fileset = <ImageFileset>{
                    ...fileset,
                    type,
                    forceResolve: llbOperation.operation.source.attrs['image.resolvemode'] === 'pull',
                    architecture: llbOperation.operation.platform.Architecture,
                    variant: llbOperation.operation.platform.Variant,
                }
            } else if (llbOperation.metadata.caps['source.git']) {
                type = FilesetType.Git

                fileset = <GitFileset>{
                    ...fileset,
                    type,
                    source: llbOperation.operation.source.identifier,
                    keepDir: llbOperation.operation.source.attrs['git.keepgitdir'] === 'true',
                }
            } else if (llbOperation.metadata.caps['source.local']) {
                type = FilesetType.Local

                fileset = <LocalFileset>{
                    ...fileset,
                    type,
                    source: llbOperation.operation.source.identifier,
                    excludePattern: JSON.parse(llbOperation.operation.source.attrs['local.excludepattern'] || '[]'),
                    includePattern: JSON.parse(llbOperation.operation.source.attrs['local.includepattern'] || '[]'),
                }
            } else if (llbOperation.metadata.caps['source.http']) {
                type = FilesetType.HTTP

                fileset = <HTTPFileset>{
                    ...fileset,
                    type,
                    source: llbOperation.operation.source.identifier,
                    checksum: llbOperation.operation.source.attrs['http.checksum'],
                    filename: llbOperation.operation.source.attrs['http.filename'],
                }
            }

            filesets.push(fileset)

            protoActions[llbOperation.digest] = <PrepareFilesetAction>{
                name,
                type: 'prepareFileset',
                filesetType: type,
            }
        } else if (actionTypeKey) {
            let descriptor: UtilityAction

            switch (actionTypeKey) {
                case 'atomic.mv':
                    descriptor = <MoveAction>{}
                    break
                case 'atomic.addfile':
                    descriptor = <AddFileAction>{}
                    break
                case 'atomic.mkdir':
                    descriptor = <MakeDirectoryAction>{}
                    break
                case 'atomic.patch':
                    descriptor = <PatchAction>{}
                    break
                case 'atomic.symlink':
                    descriptor = <CreateSymbolicLinkAction>{}
                    break
                case 'atomic.merge':
                    descriptor = <MergeAction>{}
                    break
                default:
                    console.warn(`Unrecognized atomic action type|${actionTypeKey }|`)

                    descriptor = <UtilityAction>{}
                    break
            }

            descriptor.type = actionTypeMap[ actionTypeKey ] ?? 'utility'
            descriptor.name = name

            protoActions[llbOperation.digest] = descriptor
        } else {
            protoActions[llbOperation.digest] = <UserAction>{
                type: 'custom',
                name: name ?? '',
            }
        }
    })

    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: BuildPipeline, tsks: ActionsObject){
    const buffIngester = new BuffIngester()
    const buildPipeline : BuildPipeline = buffIngester.ingest(trace)
//        , function(pl: BuildPipeline, tsks: ActionsObject){
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
    Object.keys(buildPipeline.actionsObject).forEach(function(digest){
        const traceObject = buildPipeline.actionsObject[digest]

        let typedObject: Action

        if (!protoActions[digest]) {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            // if (traceObject.name.startsWith("[source:local]")){
            Object.keys(protoActions).some(function(key){
                // console.warn("Trying ", protoActions[key].name, "vs", pipeline.actionsObject[digest].name)
                if (protoActions[key].name && protoActions[key].name == buildPipeline.actionsObject[digest].name){
                    typedObject = protoActions[key]

                    return true
                }
            })
            //}
            if (!typedObject){
                console.warn("Unable to find proto object for vertex", digest)

                return
            }
        } else {
            typedObject = protoActions[digest]
        }

        // console.warn("still ok")
        typedObject.id = traceObject.id
        typedObject.name = traceObject.name
        typedObject.cached = traceObject.cached
        typedObject.error = traceObject.error
        typedObject.digest = traceObject.digest
        typedObject.completed = traceObject.completed
        typedObject.started = traceObject.started
        typedObject.runtime = traceObject.runtime
        typedObject.status = traceObject.status
        typedObject.stdout = traceObject.stdout
        typedObject.stderr = traceObject.stderr
        typedObject.parents = traceObject.parents

        buildPipeline.actionsObject[digest] = typedObject
    })

    // extract actionObject values into an array
    const actions = Object.values(buildPipeline.actionsObject)
        .sort((a, b) => a.started - b.started) // sort values chronologically, based on start time

    delete buildPipeline.actionsObject

    return {
        ...buildPipeline,
        filesets,
        actions,
    };
}


async function run(protoPath: string, tracePath: string, meta: string, destination: string) {
    // Retrieve the protobuf definition and the trace file from wherever they are (XHR, file)
    // Here, just lazily readfilesync them
    let buff = readFileSync(protoPath)
    let trace = readFileSync(tracePath)

    // Get the pipeline and the tasks from Pantry
    let pipeline = await Pantry(buff, trace, meta)

    writeFileSync(destination, JSON.stringify(pipeline, null, 2))
    // console.warn(JSON.stringify(pipeline, null, 2))
}

run(
    process.argv[2],
    process.argv[3],
    process.argv[4],
    process.argv[5]
)
