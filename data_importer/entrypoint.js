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
    const buildActionsObject = {};
    const filesetDockerImageUrlRegex = /^docker-image:/;
    llbOperations.forEach((llbOperation) => {
        var _a, _b, _c, _d;
        const name = (_a = llbOperation.metadata.description) === null || _a === void 0 ? void 0 : _a['llb.customname'];
        const actionTypeKey = (_c = (_b = llbOperation === null || llbOperation === void 0 ? void 0 : llbOperation.metadata) === null || _b === void 0 ? void 0 : _b.description) === null || _c === void 0 ? void 0 : _c['codecomet.op'];
        if (llbOperation.metadata.caps['source.image']
            || llbOperation.metadata.caps['source.git']
            || llbOperation.metadata.caps['source.local']
            || llbOperation.metadata.caps['source.http']) {
            let fileset = {
                name,
                type: 'fileset',
                filesetType: FilesetType.Scratch,
                source: llbOperation.operation.source.identifier,
            };
            if (llbOperation.metadata.caps['source.image']) {
                fileset = Object.assign(Object.assign({}, fileset), { filesetType: FilesetType.Image, forceResolve: llbOperation.operation.source.attrs['image.resolvemode'] === 'pull', architecture: llbOperation.operation.platform.Architecture, variant: llbOperation.operation.platform.Variant });
                if (filesetDockerImageUrlRegex.test(fileset.source)) {
                    fileset.link = fileset.source.replace(filesetDockerImageUrlRegex, 'https:');
                }
            }
            else if (llbOperation.metadata.caps['source.git']) {
                fileset = Object.assign(Object.assign({}, fileset), { filesetType: FilesetType.Git, keepDir: llbOperation.operation.source.attrs['git.keepgitdir'] === 'true', link: fileset.source.replace(/^git:/, 'https:') });
            }
            else if (llbOperation.metadata.caps['source.local']) {
                fileset = Object.assign(Object.assign({}, fileset), { filesetType: FilesetType.Local, excludePattern: JSON.parse(llbOperation.operation.source.attrs['local.excludepattern'] || '[]'), includePattern: JSON.parse(llbOperation.operation.source.attrs['local.includepattern'] || '[]') });
            }
            else if (llbOperation.metadata.caps['source.http']) {
                fileset = Object.assign(Object.assign({}, fileset), { filesetType: FilesetType.HTTP, checksum: llbOperation.operation.source.attrs['http.checksum'], filename: llbOperation.operation.source.attrs['http.filename'], link: fileset.source });
            }
            buildActionsObject[llbOperation.digest] = fileset;
        }
        else if (actionTypeKey) {
            let descriptor;
            switch (actionTypeKey) {
                case 'atomic.mkdir':
                    descriptor = {
                        utilityName: 'make directory',
                    };
                    break;
                case 'atomic.mv':
                    descriptor = {
                        utilityName: 'move',
                    };
                    break;
                case 'atomic.addfile':
                    descriptor = {
                        utilityName: 'add file',
                    };
                    break;
                case 'atomic.patch':
                    descriptor = {
                        utilityName: 'patch',
                    };
                    break;
                case 'atomic.symlink':
                    descriptor = {
                        utilityName: 'create symbolic link',
                    };
                    break;
                case 'atomic.merge':
                    descriptor = {
                        utilityName: 'merge',
                    };
                    break;
                default:
                    console.warn(`Unrecognized atomic action type|${actionTypeKey}|`);
                    descriptor = {};
                    break;
            }
            descriptor.type = (_d = actionTypeMap[actionTypeKey]) !== null && _d !== void 0 ? _d : 'utility';
            descriptor.name = name;
            buildActionsObject[llbOperation.digest] = descriptor;
        }
        else {
            buildActionsObject[llbOperation.digest] = {
                type: 'custom',
                name: name !== null && name !== void 0 ? name : '',
            };
        }
    });
    // throw "lol"
    // Suck up stdin for the logs
    // new StdinIngester(stdin, function(pl: BuildPipeline, tsks: BuildActionsObject){
    const buffIngester = new BuffIngester();
    const buildPipeline = buffIngester.ingest(trace);
    //        , function(pl: BuildPipeline, tsks: BuildActionsObject){
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
        var _a, _b;
        const traceObject = buildPipeline.actionsObject[digest];
        let typedObject;
        if (buildActionsObject[digest]) {
            typedObject = buildActionsObject[digest];
        }
        else {
            // This is not good. Bad shit here: https://github.com/moby/buildkit/issues/3693
            // So, try very-very hard to still retrieve the object, even with a different digest
            for (const key of Object.keys(buildActionsObject)) {
                if (((_a = buildActionsObject[key]) === null || _a === void 0 ? void 0 : _a.name) === ((_b = buildPipeline.actionsObject[digest]) === null || _b === void 0 ? void 0 : _b.name)) {
                    typedObject = buildActionsObject[key];
                    break;
                }
            }
            if (!typedObject) {
                console.warn("Unable to find proto object for vertex", digest);
                return;
            }
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
        typedObject.buildParents = traceObject.buildParents;
        buildPipeline.actionsObject[digest] = typedObject;
    });
    const filesets = [];
    const actions = [];
    for (const digest of buildPipeline.actionsOrder) {
        const item = buildPipeline.actionsObject[digest];
        if (!item) {
            continue;
        }
        if (item.type === 'fileset') {
            filesets.push(item);
        }
        else {
            let parents;
            if (item.buildParents) {
                parents = item.buildParents
                    .filter((digest) => buildPipeline.actionsObject[digest])
                    .sort((a, b) => buildPipeline.actionsObject[a].started - buildPipeline.actionsObject[b].started) // sort values chronologically, based on start time
                    .map((digest) => ({
                    digest,
                    name: buildPipeline.actionsObject[digest].name,
                }));
            }
            delete item.buildParents;
            actions.push(Object.assign(Object.assign({}, item), { parents }));
        }
    }
    delete buildPipeline.actionsOrder;
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