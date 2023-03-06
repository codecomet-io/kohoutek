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
    let metadata = {};
    metadata = JSON.parse(meta);
    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    let [ops, err] = ingest(buff);
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: Pipeline, tsks: TasksPool){
    let bi = new BuffIngester();
    let pl = bi.ingest(trace);
    //        , function(pl: Pipeline, tsks: TasksPool){
    // XXX piggyback on metadata
    pl.id = metadata.id;
    pl.description = metadata.description;
    pl.repository.commit = metadata.commit;
    pl.repository.author = metadata.author;
    pl.repository.parent = metadata.parent;
    pl.repository.dirty = metadata.dirty;
    pl.repository.location = metadata.location;
    // callback(pl, tsks)
    // console.warn(JSON.stringify(tsks, null, 2))
    //         ops.forEach(function(op){
    //             console.warn(op.Digest)
    //             // OpMetadata
    //         })
    // console.warn(JSON.stringify(pl, null, 2))
    //        })
    return pl;
}
async function run(protoPath, tracePath, meta, destination) {
    // Retrieve the protobuf definition and the trace file from wherever they are (XHR, file)
    // Here, just lazily readfilesync them
    let buff = readFileSync(protoPath);
    let trace = readFileSync(tracePath);
    // Get the pipeline and the tasks from Pantry
    let aPipeline = await Pantry(buff, trace, meta);
    writeFileSync(destination, JSON.stringify(aPipeline, null, 2));
    // console.warn(JSON.stringify(aPipeline, null, 2))
}
run(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
//# sourceMappingURL=entrypoint.js.map