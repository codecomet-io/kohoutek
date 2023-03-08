import { Tracer } from "./dependencies/ts-core/sentry.js";
import { BuffIngester } from "./lib/ts-trace-sdk/ingester.js";
import { nil } from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import { ReadFromIMPL } from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import { Protobuf } from "codecomet-js/source/utils/protobuf.js";
import { digest as CryptoDigest } from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import { readFileSync, writeFileSync } from "fs";
// Init Sentry
new Tracer("https://c02314800c4d4be2a32f1d28c4220f3f@o1370052.ingest.sentry.io/6673370");
function ingest(buffer) {
    const [def, err] = ReadFromIMPL(buffer);
    if (err != nil) {
        return [nil, err];
    }
    const operations = def.Def.map((dt) => {
        const digest = CryptoDigest.FromBytes(dt);
        return {
            digest,
            operation: Protobuf.read("Op", dt),
            metadata: def.Metadata[digest],
        };
    });
    return [operations, nil];
}
export default async function Pantry(buffer, trace, meta) {
    await CodeComet.Bootstrap();
    // Spoof in metadata
    const metadata = JSON.parse(meta);
    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    const [llbOperations, err] = ingest(buffer);
    const fromProto = {};
    llbOperations.forEach((llbOperation) => {
        // console.warn(JSON.stringify(operation.digest, null, 2))
        if (llbOperation.metadata.caps['source.image']) {
            fromProto[llbOperation.digest] = {
                source: llbOperation.operation.source.identifier,
                forceResolve: llbOperation.operation.source.attrs["image.resolvemode"] === "pull",
                architecture: llbOperation.operation.platform.Architecture,
                variant: llbOperation.operation.platform.Variant,
                typeHint: "fileset.image",
                name: llbOperation.metadata.description["llb.customname"],
            };
        }
        else if (llbOperation.metadata.caps['source.git']) {
            fromProto[llbOperation.digest] = {
                source: llbOperation.operation.source.identifier,
                keepDir: llbOperation.operation.source.attrs["git.keepgitdir"] === "true",
                typeHint: "fileset.git",
                name: llbOperation.metadata.description["llb.customname"],
            };
        }
        else if (llbOperation.metadata.caps['source.local']) {
            // console.warn("Local", llbOperation.digest)
            // console.warn(JSON.stringify(llbOperation.Op, null, 2))
            fromProto[llbOperation.digest] = {
                source: llbOperation.operation.source.identifier,
                excludePattern: JSON.parse(llbOperation.operation.source.attrs["local.excludepattern"] || "[]"),
                includePattern: JSON.parse(llbOperation.operation.source.attrs["local.includepattern"] || "[]"),
                typeHint: "fileset.local",
                name: llbOperation.metadata.description["llb.customname"],
            };
        }
        else if (llbOperation.metadata.caps['source.http']) {
            // console.warn(JSON.stringify(llbOperation.Op, null, 2))
            fromProto[llbOperation.digest] = {
                source: llbOperation.operation.source.identifier,
                checksum: llbOperation.operation.source.attrs["http.checksum"],
                filename: llbOperation.operation.source.attrs["http.filename"],
                typeHint: "fileset.http",
                name: llbOperation.metadata.description["llb.customname"],
            };
        }
        else if (llbOperation.metadata.description && llbOperation.metadata.description["codecomet.op"]) {
            let descriptor;
            switch (llbOperation.metadata.description["codecomet.op"]) {
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
                    console.warn("Unrecognized atomic action type|" + llbOperation.metadata.description["codecomet.op"] + "|");
                    descriptor = {};
                    break;
            }
            descriptor.typeHint = llbOperation.metadata.description["codecomet.op"];
            descriptor.name = llbOperation.metadata.description["llb.customname"];
            fromProto[llbOperation.digest] = descriptor;
        }
        else {
            fromProto[llbOperation.digest] = {
                typeHint: "user.action",
                name: llbOperation.metadata.description
                    ? llbOperation.metadata.description["llb.customname"]
                    : "",
            };
            // console.warn(llbOperation.metadata)
        }
    });
    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: BuildPipeline, tsks: ActionsObject){
    const buffIngester = new BuffIngester();
    const buildPipeline = buffIngester.ingest(trace);
    //        , function(pl: BuildPipeline, tsks: ActionsObject){
    // XXX piggyback on metadata
    buildPipeline.id = metadata.id;
    buildPipeline.description = metadata.description;
    buildPipeline.repository.commit = metadata.commit;
    buildPipeline.repository.author = metadata.author;
    buildPipeline.repository.parent = metadata.parent;
    buildPipeline.repository.dirty = metadata.dirty;
    buildPipeline.repository.location = metadata.location;
    // Geez this is shit. @spacedub burn all of this with fire and rewrite the stitching probably (later...)
    // briznad: @spacedub you're too hard on yourself
    Object.keys(buildPipeline.actionsObject).forEach(function (digest) {
        const traceObject = buildPipeline.actionsObject[digest];
        let typedObject;
        if (!fromProto[digest]) {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            // if (traceObject.name.startsWith("[source:local]")){
            Object.keys(fromProto).some(function (key) {
                // console.warn("Trying ", fromProto[key].name, "vs", pipeline.actionsObject[digest].name)
                if (fromProto[key].name && fromProto[key].name == buildPipeline.actionsObject[digest].name) {
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
        buildPipeline.actionsObject[digest] = typedObject;
    });
    // extract actionObject values into an array
    const actions = Object.values(buildPipeline.actionsObject)
        .sort((a, b) => a.started - b.started); // sort values chronologically, based on start time
    delete buildPipeline.actionsObject;
    return Object.assign(Object.assign({}, buildPipeline), { actions });
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