import { Tracer } from "./dependencies/ts-core/sentry.js";
import { BuffIngester } from "./lib/ts-trace-sdk/ingester.js";
import { nil } from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import { ReadFromIMPL } from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import { Protobuf } from "codecomet-js/source/utils/protobuf.js";
import { digest } from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import { readFileSync, writeFileSync } from "fs";
// Init Sentry
new Tracer("https://c02314800c4d4be2a32f1d28c4220f3f@o1370052.ingest.sentry.io/6673370");
function ingest(buff) {
    let [def, err] = ReadFromIMPL(buff);
    if (err != nil)
        return [nil, err];
    var ops = [];
    def.Def.forEach(function (dt) {
        let op = Protobuf.read("Op", dt);
        let dgst = digest.FromBytes(dt);
        let ent = {
            Op: op,
            Digest: dgst,
            OpMetadata: def.Metadata[dgst]
        };
        ops.push(ent);
    });
    return [ops, nil];
}
export default async function Pantry(buff, trace, meta) {
    await CodeComet.Bootstrap();
    // Spoof in metadata
    let metadata = JSON.parse(meta);
    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    let [ops, err] = ingest(buff);
    let fromProto = {};
    ops.forEach(function (op) {
        // console.warn(JSON.stringify(op.Digest, null, 2))
        if (op.OpMetadata.caps["source.image"] !== undefined) {
            fromProto[op.Digest] = {
                source: op.Op.source.identifier,
                forceResolve: op.Op.source.attrs["image.resolvemode"] === "pull",
                architecture: op.Op.platform.Architecture,
                variant: op.Op.platform.Variant,
                typeHint: "fileset.image",
                name: op.OpMetadata.description["llb.customname"],
            };
        }
        else if (op.OpMetadata.caps["source.git"] !== undefined) {
            fromProto[op.Digest] = {
                source: op.Op.source.identifier,
                keepDir: op.Op.source.attrs["git.keepgitdir"] === "true",
                typeHint: "fileset.git",
                name: op.OpMetadata.description["llb.customname"],
            };
        }
        else if (op.OpMetadata.caps["source.local"] !== undefined) {
            // console.warn("Local", op.Digest)
            // console.warn(JSON.stringify(op.Op, null, 2))
            fromProto[op.Digest] = {
                source: op.Op.source.identifier,
                excludePattern: JSON.parse(op.Op.source.attrs["local.excludepattern"] || "[]"),
                includePattern: JSON.parse(op.Op.source.attrs["local.includepattern"] || "[]"),
                typeHint: "fileset.local",
                name: op.OpMetadata.description["llb.customname"],
            };
        }
        else if (op.OpMetadata.caps["source.http"] !== undefined) {
            // console.warn(JSON.stringify(op.Op, null, 2))
            fromProto[op.Digest] = {
                source: op.Op.source.identifier,
                checksum: op.Op.source.attrs["http.checksum"],
                filename: op.Op.source.attrs["http.filename"],
                typeHint: "fileset.http",
                name: op.OpMetadata.description["llb.customname"],
            };
        }
        else if (op.OpMetadata.description !== undefined && op.OpMetadata.description["codecomet.op"] !== "") {
            let descriptor;
            switch (op.OpMetadata.description["codecomet.op"]) {
                case "atomic.mv":
                    descriptor = {};
                    break;
                case "atomic.addfile":
                    descriptor = {};
                    break;
                case "atomic.mkdir":
                    descriptor = {};
                    break;
                case "atomic.patch":
                    descriptor = {};
                    break;
                case "atomic.symlink":
                    descriptor = {};
                    break;
                case "atomic.merge":
                    descriptor = {};
                    break;
                default:
                    console.warn("Unrecognized atomic action type|" + op.OpMetadata.description["codecomet.op"] + "|");
                    descriptor = {};
                    break;
            }
            descriptor.typeHint = op.OpMetadata.description["codecomet.op"];
            descriptor.name = op.OpMetadata.description["llb.customname"];
            fromProto[op.Digest] = descriptor;
        }
        else {
            fromProto[op.Digest] = {
                typeHint: "user.action",
                name: !!op.OpMetadata.description ? op.OpMetadata.description["llb.customname"] : "",
            };
            // console.warn(op.OpMetadata)
        }
    });
    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: Pipeline, tsks: TasksPool){
    let buffIngester = new BuffIngester();
    let pipeline = buffIngester.ingest(trace);
    //        , function(pl: Pipeline, tsks: TasksPool){
    // XXX piggyback on metadata
    pipeline.id = metadata.id;
    pipeline.description = metadata.description;
    pipeline.repository.commit = metadata.commit;
    pipeline.repository.author = metadata.author;
    pipeline.repository.parent = metadata.parent;
    pipeline.repository.dirty = metadata.dirty;
    pipeline.repository.location = metadata.location;
    // Geez this is shit. @spacedub burn all of this with fire and rewrite the stitching probably (later...)
    Object.keys(pipeline.tasksPool).forEach(function (digest) {
        let traceObject = pipeline.tasksPool[digest];
        let typedObject;
        if (!(digest in fromProto)) {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            // if (traceObject.name.startsWith("[source:local]")){
            Object.keys(fromProto).some(function (key) {
                // console.warn("Trying ", fromProto[key].name, "vs", pipeline.tasksPool[digest].name)
                if (!!fromProto[key].name && fromProto[key].name == pipeline.tasksPool[digest].name) {
                    typedObject = fromProto[key];
                    return true;
                }
            });
            //}
            if (!typedObject) {
                console.warn("Unable to find proto object for vertex", digest);
                return;
            }
        }
        else {
            typedObject = fromProto[digest];
        }
        // console.warn("still ok")
        typedObject.id = traceObject.id;
        typedObject.name = traceObject.name;
        typedObject.cached = traceObject.cached;
        typedObject.error = traceObject.error;
        typedObject.digest = traceObject.digest;
        typedObject.completed = traceObject.completed;
        typedObject.started = traceObject.started;
        typedObject.runtime = traceObject.runtime;
        typedObject.status = traceObject.status;
        typedObject.stdout = traceObject.stdout;
        typedObject.stderr = traceObject.stderr;
        typedObject.parents = traceObject.parents;
        pipeline.tasksPool[digest] = typedObject;
    });
    // callback(pipeline, tsks)
    // console.warn(JSON.stringify(tsks, null, 2))
    //         ops.forEach(function(op){
    //             console.warn(op.Digest)
    //             // OpMetadata
    //         })
    // console.warn(JSON.stringify(pipeline, null, 2))
    //        })
    return pipeline;
}
async function run(protoPath, tracePath, meta, destination) {
    // Retrieve the protobuf definition and the trace file from wherever they are (XHR, file)
    // Here, just lazily readfilesync them
    let buff = readFileSync(protoPath);
    let trace = readFileSync(tracePath);
    // Get the pipeline and the tasks from Pantry
    let pipeline = await Pantry(buff, trace, meta);
    writeFileSync(destination, JSON.stringify(pipeline, null, 2));
    // console.warn(JSON.stringify(pipeline, null, 2))
}
run(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
//# sourceMappingURL=entrypoint.js.map