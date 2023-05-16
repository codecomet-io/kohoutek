import * as os from "node:os";
// Re-export
export * from "./model/run.js";
export * from "./model/logs.js";
/*
 * A runner is a machine able to run CodeComet pipelines
 * Right now this is being initialized with details from the machine running this script
 */
export class Host {
    constructor(id, meta) {
        // runtime information
        this.runtime = process.versions;
        this.system = {
            arch: os.arch(),
            cpus: os.cpus(),
            endianness: os.endianness(),
            freemem: os.freemem(),
            home: os.homedir(),
            hostname: os.hostname(),
            loadavg: os.loadavg(),
            networkInterfaces: os.networkInterfaces(),
            platform: os.platform(),
            release: os.release(),
            tmpdir: os.tmpdir(),
            totalmem: os.totalmem(),
            type: os.type(),
            uptime: os.uptime(),
            userInfo: os.userInfo(),
            version: os.version(),
        };
        this.owner = {
            id: "spacedub",
            name: "Space Raccoon",
        };
        this.id = id;
        this.metadata = meta;
    }
}
export var FilesetType;
(function (FilesetType) {
    FilesetType["Git"] = "git";
    FilesetType["HTTP"] = "http";
    FilesetType["Image"] = "docker";
    FilesetType["Local"] = "local";
    FilesetType["Scratch"] = "scratch";
})(FilesetType = FilesetType || (FilesetType = {}));
//# sourceMappingURL=model.js.map