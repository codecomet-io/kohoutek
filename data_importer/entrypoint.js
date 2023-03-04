import { __awaiter, __generator } from "tslib";
import { Tracer } from "./dependencies/ts-core/sentry.js";
import { BuffIngester } from "./lib/ts-trace-sdk/ingester.js";
import { nil } from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import { ReadFromIMPL } from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import { Protobuf } from "codecomet-js/source/utils/protobuf.js";
import { digest } from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
// Init Sentry
new Tracer("https://c02314800c4d4be2a32f1d28c4220f3f@o1370052.ingest.sentry.io/6673370");
function ingest(buff) {
    var _a = ReadFromIMPL(buff), def = _a[0], err = _a[1];
    if (err != nil)
        return [nil, err];
    var ops = [];
    def.Def.forEach(function (dt) {
        var op = Protobuf.read("Op", dt);
        var dgst = digest.FromBytes(dt);
        var ent = {
            Op: op,
            Digest: dgst,
            OpMetadata: def.Metadata[dgst]
        };
        ops.push(ent);
    });
    return [ops, nil];
}
export default function Pantry(buff, trace, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var metadata, _a, ops, err, bi, _b, pl, tsks;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, CodeComet.Bootstrap()
                    // Spoof in metadata
                ];
                case 1:
                    _c.sent();
                    metadata = {};
                    metadata = JSON.parse(meta);
                    _a = ingest(buff), ops = _a[0], err = _a[1];
                    bi = new BuffIngester();
                    _b = bi.ingest(trace), pl = _b[0], tsks = _b[1];
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
                    return [2 /*return*/, [pl, tsks]];
            }
        });
    });
}
//# sourceMappingURL=entrypoint.js.map