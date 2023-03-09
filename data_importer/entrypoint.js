import { Tracer } from "./dependencies/ts-core/sentry.js";
import { BuffIngester } from "./lib/ingester.js";
import { FilesetType } from "./lib/model.js";
import { nil } from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import CodeComet from "codecomet-js/index.js";
import { ReadFromIMPL } from "codecomet-js/source/buildkit-port/client/llb/marshal.js";
import { Protobuf } from "codecomet-js/source/utils/protobuf.js";
import { digest as CryptoDigest } from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import { readFileSync, writeFileSync } from "fs";
// Init Sentry
new Tracer("https://c02314800c4d4be2a32f1d28c4220f3f@o1370052.ingest.sentry.io/6673370");
const actionTypeMap = {
    'atomic.mv': 'move',
    'atomic.addfile': 'addFile',
    'atomic.mkdir': 'makeDirectory',
    'atomic.patch': 'patch',
    'atomic.symlink': 'createSymbolicLink',
    'atomic.merge': 'merge',
};
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
    const filesets = [];
    const protoActions = {};
    llbOperations.forEach((llbOperation) => {
        var _a, _b, _c, _d;
        const name = (_a = llbOperation.metadata.description) === null || _a === void 0 ? void 0 : _a['llb.customname'];
        const actionTypeKey = (_c = (_b = llbOperation === null || llbOperation === void 0 ? void 0 : llbOperation.metadata) === null || _b === void 0 ? void 0 : _b.description) === null || _c === void 0 ? void 0 : _c['codecomet.op'];
        if (llbOperation.metadata.caps['source.image']
            || llbOperation.metadata.caps['source.git']
            || llbOperation.metadata.caps['source.local']
            || llbOperation.metadata.caps['source.http']) {
            let type = FilesetType.Scratch;
            let fileset = {
                name,
                type,
                id: 'tempNonUniqueFilesetId',
                source: llbOperation.operation.source.identifier,
            };
            if (llbOperation.metadata.caps['source.image']) {
                type = FilesetType.Image;
                fileset = Object.assign(Object.assign({}, fileset), { type, forceResolve: llbOperation.operation.source.attrs['image.resolvemode'] === 'pull', architecture: llbOperation.operation.platform.Architecture, variant: llbOperation.operation.platform.Variant });
            }
            else if (llbOperation.metadata.caps['source.git']) {
                type = FilesetType.Git;
                fileset = Object.assign(Object.assign({}, fileset), { type, source: llbOperation.operation.source.identifier, keepDir: llbOperation.operation.source.attrs['git.keepgitdir'] === 'true' });
            }
            else if (llbOperation.metadata.caps['source.local']) {
                type = FilesetType.Local;
                fileset = Object.assign(Object.assign({}, fileset), { type, source: llbOperation.operation.source.identifier, excludePattern: JSON.parse(llbOperation.operation.source.attrs['local.excludepattern'] || '[]'), includePattern: JSON.parse(llbOperation.operation.source.attrs['local.includepattern'] || '[]') });
            }
            else if (llbOperation.metadata.caps['source.http']) {
                type = FilesetType.HTTP;
                fileset = Object.assign(Object.assign({}, fileset), { type, source: llbOperation.operation.source.identifier, checksum: llbOperation.operation.source.attrs['http.checksum'], filename: llbOperation.operation.source.attrs['http.filename'] });
            }
            filesets.push(fileset);
            protoActions[llbOperation.digest] = {
                name,
                type: 'prepareFileset',
                filesetType: type,
            };
        }
        else if (actionTypeKey) {
            let descriptor;
            switch (actionTypeKey) {
                case 'atomic.mv':
                    descriptor = {};
                    break;
                case 'atomic.addfile':
                    descriptor = {};
                    break;
                case 'atomic.mkdir':
                    descriptor = {};
                    break;
                case 'atomic.patch':
                    descriptor = {};
                    break;
                case 'atomic.symlink':
                    descriptor = {};
                    break;
                case 'atomic.merge':
                    descriptor = {};
                    break;
                default:
                    console.warn(`Unrecognized atomic action type|${actionTypeKey}|`);
                    descriptor = {};
                    break;
            }
            descriptor.type = (_d = actionTypeMap[actionTypeKey]) !== null && _d !== void 0 ? _d : 'utility';
            descriptor.name = name;
            protoActions[llbOperation.digest] = descriptor;
        }
        else {
            protoActions[llbOperation.digest] = {
                type: 'custom',
                name: name !== null && name !== void 0 ? name : '',
            };
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
    // disable repository output for now
    // it leaks info and isn't currently needed
    // buildPipeline.repository.commit = metadata.commit
    // buildPipeline.repository.author = metadata.author
    // buildPipeline.repository.parent = metadata.parent
    // buildPipeline.repository.dirty = metadata.dirty
    // buildPipeline.repository.location = metadata.location
    // Geez this is shit. @spacedub burn all of this with fire and rewrite the stitching probably (later...)
    // briznad: @spacedub you're too hard on yourself
    Object.keys(buildPipeline.actionsObject).forEach(function (digest) {
        const traceObject = buildPipeline.actionsObject[digest];
        let typedObject;
        if (!protoActions[digest]) {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            // if (traceObject.name.startsWith("[source:local]")){
            Object.keys(protoActions).some(function (key) {
                // console.warn("Trying ", protoActions[key].name, "vs", pipeline.actionsObject[digest].name)
                if (protoActions[key].name && protoActions[key].name == buildPipeline.actionsObject[digest].name) {
                    typedObject = protoActions[key];
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
            typedObject = protoActions[digest];
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
    return Object.assign(Object.assign({}, buildPipeline), { filesets,
        actions });
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