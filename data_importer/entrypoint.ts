import {Tracer} from "./dependencies/ts-core/sentry.js"
import {StdinIngester, BuffIngester} from "./lib/ts-trace-sdk/ingester.js";
import {
    ActionInstance,
    ActionStatus, AddFileAtomicAction, AtomicAction, CoreNode,
    Fileset,
    GitFileset, HTTPFileset,
    ImageFileset, LocalFileset, MergeAction, MkdirAtomicAction, MvAtomicAction, PatchAtomicAction,
    Pipeline, SymlinkAtomicAction,
    TasksPool, UserAction
} from "./lib/ts-trace-sdk/model.js";
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

    const fromProto: { [key in CryptoDigest.Digest ] : CoreNode } = {}

    llbOperations.forEach((llbOperation) => {
        // console.warn(JSON.stringify(operation.digest, null, 2))
        if (llbOperation.metadata.caps['source.image']) {
            fromProto[llbOperation.digest] = <ImageFileset>{
                source: llbOperation.operation.source.identifier,
                forceResolve: llbOperation.operation.source.attrs["image.resolvemode"] === "pull",
                architecture: llbOperation.operation.platform.Architecture,
                variant: llbOperation.operation.platform.Variant,
                typeHint: "fileset.image",
                name: llbOperation.metadata.description["llb.customname"],
            }
        } else if (llbOperation.metadata.caps['source.git']) {
            fromProto[llbOperation.digest] = <GitFileset>{
                source: llbOperation.operation.source.identifier,
                keepDir: llbOperation.operation.source.attrs["git.keepgitdir"] === "true",
                typeHint: "fileset.git",
                name: llbOperation.metadata.description["llb.customname"],
            }
        } else if (llbOperation.metadata.caps['source.local']) {
            // console.warn("Local", llbOperation.digest)
            // console.warn(JSON.stringify(llbOperation.Op, null, 2))
            fromProto[llbOperation.digest] = <LocalFileset>{
                source: llbOperation.operation.source.identifier,
                excludePattern: JSON.parse(llbOperation.operation.source.attrs["local.excludepattern"] || "[]"),
                includePattern: JSON.parse(llbOperation.operation.source.attrs["local.includepattern"] || "[]"),
                typeHint: "fileset.local",
                name: llbOperation.metadata.description["llb.customname"],
            }
        } else if (llbOperation.metadata.caps['source.http']) {
            // console.warn(JSON.stringify(llbOperation.Op, null, 2))
            fromProto[llbOperation.digest] = <HTTPFileset>{
                source: llbOperation.operation.source.identifier,
                checksum: llbOperation.operation.source.attrs["http.checksum"],
                filename: llbOperation.operation.source.attrs["http.filename"],
                typeHint: "fileset.http",
                name: llbOperation.metadata.description["llb.customname"],
            }
        } else if (llbOperation.metadata.description && llbOperation.metadata.description["codecomet.op"]) {
            let descriptor: AtomicAction

            switch (llbOperation.metadata.description["codecomet.op"]) {
                case "atomic.mv":
                    descriptor = <MvAtomicAction>{}
                    break
                case "atomic.addfile":
                    descriptor = <AddFileAtomicAction>{}
                    break
                case "atomic.mkdir":
                    descriptor = <MkdirAtomicAction>{}
                    break
                case "atomic.patch":
                    descriptor = <PatchAtomicAction>{}
                    break
                case "atomic.symlink":
                    descriptor = <SymlinkAtomicAction>{}
                    break
                case "atomic.merge":
                    descriptor = <MergeAction>{}
                    break
                default:
                    console.warn("Unrecognized atomic action type|" + llbOperation.metadata.description["codecomet.op"] + "|")
                    descriptor = <AtomicAction>{}
                    break
            }

            descriptor.typeHint = llbOperation.metadata.description["codecomet.op"]
            descriptor.name = llbOperation.metadata.description["llb.customname"]

            fromProto[llbOperation.digest] = descriptor
        } else {
            fromProto[llbOperation.digest] = <UserAction>{
                typeHint: "user.action",
                name: llbOperation.metadata.description
                    ? llbOperation.metadata.description["llb.customname"]
                    : "",
            }
            // console.warn(llbOperation.metadata)
        }
    })

    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: Pipeline, tsks: TasksPool){
    const buffIngester = new BuffIngester()
    const pipeline = buffIngester.ingest(trace)
//        , function(pl: Pipeline, tsks: TasksPool){
    // XXX piggyback on metadata
    pipeline.id = metadata.id
    pipeline.description = metadata.description
    pipeline.repository.commit = metadata.commit
    pipeline.repository.author = metadata.author
    pipeline.repository.parent = metadata.parent
    pipeline.repository.dirty = metadata.dirty
    pipeline.repository.location = metadata.location

    // Geez this is shit. @spacedub burn all of this with fire and rewrite the stitching probably (later...)
    Object.keys(pipeline.tasksPool).forEach(function(digest){
        let traceObject = pipeline.tasksPool[digest]
        let typedObject: CoreNode
        if (!(digest in fromProto)){
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            // if (traceObject.name.startsWith("[source:local]")){
            Object.keys(fromProto).some(function(key){
                // console.warn("Trying ", fromProto[key].name, "vs", pipeline.tasksPool[digest].name)
                if (fromProto[key].name && fromProto[key].name == pipeline.tasksPool[digest].name){
                    typedObject = fromProto[key]

                    return true
                }
            })
            //}
            if (!typedObject){
                console.warn("Unable to find proto object for vertex", digest)
                return
            }
        }else{
            typedObject = fromProto[digest]
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

        pipeline.tasksPool[digest] = typedObject
    })

            // callback(pipeline, tsks)
            // console.warn(JSON.stringify(tsks, null, 2))
            //         ops.forEach(function(op){
            //             console.warn(op.Digest)
            //             // OpMetadata
            //         })
            // console.warn(JSON.stringify(pipeline, null, 2))
//        })
    return pipeline
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
