import {Tracer} from "./dependencies/ts-core/sentry.js"
import {StdinIngester, BuffIngester} from "./lib/ts-trace-sdk/ingester.js";
import {
    ActionInstance,
    ActionStatus, CoreNode,
    FileSet,
    GitFileSet, HTTPFileSet,
    ImageFileSet, LocalFileSet,
    Pipeline,
    TasksPool
} from "./lib/ts-trace-sdk/model.js";
import {stdin} from "node:process";
import {bool, error, nil} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import {ReadFromIMPL} from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import {Protobuf} from "codecomet-js/source/utils/protobuf.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import {readFileSync, writeFileSync} from "fs";

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



type llbOp = {
    Op:         Types.Op
    Digest:     digest.Digest
    OpMetadata: Types.OpMetadata
}

function ingest(buff: Buffer): [llbOp[], error] {
    let [def, err] = ReadFromIMPL(buff)
    if (err != nil)
        return [nil, err]

    var ops: llbOp[] = []
    def.Def.forEach(function(dt) {
        let op = <Types.Op>Protobuf.read("Op", dt)
        let dgst = digest.FromBytes(dt)
        let ent = <llbOp>{
            Op: op,
            Digest: dgst,
            OpMetadata: def.Metadata[dgst]
        }
        ops.push(ent)
    })
    return [ops, nil]
}

export default async function Pantry(buff: Buffer, trace: Buffer, meta: string): Promise<Pipeline> {
    await CodeComet.Bootstrap()

    // Spoof in metadata
    let metadata = <Meta>JSON.parse(meta);

    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    let [ops, err] = ingest(buff);
    let fromProto: {[key: digest.Digest]: CoreNode} = {}
    ops.forEach(function(op){
        // console.warn(JSON.stringify(op.Digest, null, 2))
        // console.warn(JSON.stringify(op.OpMetadata.caps, null, 2))
        if (op.OpMetadata.caps["source.image"] !== undefined) {
            fromProto[op.Digest] = <ImageFileSet>{
                source: op.Op.source.identifier,
                forceResolve: op.Op.source.attrs["image.resolvemode"] === "pull",
                architecture: op.Op.platform.Architecture,
                variant: op.Op.platform.Variant,
                typeHint: "fileset.image",
            }
        }else if (op.OpMetadata.caps["source.git"] !== undefined) {
            fromProto[op.Digest] = <GitFileSet>{
                source: op.Op.source.identifier,
                keepDir: op.Op.source.attrs["git.keepgitdir"] === "true",
                typeHint: "fileset.git",
            }
        }else if (op.OpMetadata.caps["source.local"] !== undefined) {
            // console.warn(JSON.stringify(op.Op, null, 2))
            fromProto[op.Digest] = <LocalFileSet>{
                source: op.Op.source.identifier,
                excludePattern: JSON.parse(op.Op.source.attrs["local.excludepattern"] || "[]"),
                includePattern: JSON.parse(op.Op.source.attrs["local.includepattern"] || "[]"),
                typeHint: "fileset.local",
            }
        }else if (op.OpMetadata.caps["source.http"] !== undefined) {
            // console.warn(JSON.stringify(op.Op, null, 2))
            fromProto[op.Digest] = <HTTPFileSet>{
                source: op.Op.source.identifier,
                checksum: op.Op.source.attrs["http.checksum"],
                filename: op.Op.source.attrs["http.filename"],
                typeHint: "fileset.http",
            }
        }
    })

    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: Pipeline, tsks: TasksPool){
    let buffIngester = new BuffIngester()
    let pipeline = buffIngester.ingest(trace)
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
        if (!(digest in fromProto)){
            console.warn("No proto definition for " + digest)
            return
        }

        let traceObject = pipeline.tasksPool[digest]
        let typedObject = fromProto[digest]
        typedObject.id = traceObject.id
        typedObject.cached = traceObject.cached
        typedObject.error = traceObject.error
        typedObject.digest = traceObject.digest
        typedObject.completed = traceObject.completed
        typedObject.started = traceObject.started
        typedObject.runtime = traceObject.runtime
        typedObject.status = traceObject.status
        typedObject.stdout = traceObject.stdout
        typedObject.stderr = traceObject.stderr

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
