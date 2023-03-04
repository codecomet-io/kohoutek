import {Tracer} from "./dependencies/ts-core/sentry.js"
import {StdinIngester, BuffIngester} from "./lib/ts-trace-sdk/ingester.js";
import {ActionInstance, ActionStatus, Pipeline, TasksPool} from "./lib/ts-trace-sdk/model.js";
import {stdin} from "node:process";
import {bool, error, nil} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import {ReadFromIMPL} from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import {Protobuf} from "codecomet-js/source/utils/protobuf.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import {readFileSync} from "fs";

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

export default async function Pantry(buff: Buffer, trace: Buffer, meta: string): Promise<[Pipeline, TasksPool]> {
    await CodeComet.Bootstrap()

    // Spoof in metadata
    let metadata: Meta = <Meta>{}
    metadata = JSON.parse(meta)

    // Retrieve the data model from protobuf first, chain that into the ingester
    // Suck up the serialized protobuf, spit out semi-acceptable objects
    let [ops, err] = ingest(buff);

    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: Pipeline, tsks: TasksPool){
    let bi = new BuffIngester()
    let [pl, tsks] = bi.ingest(trace)
//        , function(pl: Pipeline, tsks: TasksPool){
    // XXX piggyback on metadata
    pl.id = metadata.id
    pl.description = metadata.description
    pl.repository.commit = metadata.commit
    pl.repository.author = metadata.author
    pl.repository.parent = metadata.parent
    pl.repository.dirty = metadata.dirty
    pl.repository.location = metadata.location

            // callback(pl, tsks)
            // console.warn(JSON.stringify(tsks, null, 2))
            //         ops.forEach(function(op){
            //             console.warn(op.Digest)
            //             // OpMetadata
            //         })
            // console.warn(JSON.stringify(pl, null, 2))
//        })
    return [pl, tsks]
}

