import * as os from "node:os";
/*
 * A runner is a machine able to run CodeComet pipelines.
 * Right now this is being initialized with details from the machine running this script
 */
export class Host {
    /*= {
        nickname: "macRaccoon",
        description: "lalalala",
        grouptag: "red-team",
        random: "joke"
    }*/
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
            version: os.version()
        };
        this.owner = {
            id: "spacedub",
            name: "Space Raccoon"
        };
        this.id = id;
        this.metadata = meta;
    }
}
// usage: process.resourceUsage(),
/*
 * PipelineStatus represents the completion status of the plan.
 * Possible values are:
 * - errored: an action failed
 * - cancelled: the pipeline was interrupted (by the user, or the process has been otherwise killed)
 * - completed: all actions succesfully returned and the pipeline has completed
 */
export var PipelineStatus;
(function (PipelineStatus) {
    // At least one non optional task errored out
    PipelineStatus["Errored"] = "errored";
    // The plan was interrupted (user interrupt, crash, network shutdown, poney, whatever)
    PipelineStatus["Cancelled"] = "canceled";
    // All tasks returned succesfully
    PipelineStatus["Completed"] = "completed";
    // All non-optional tasks returned successfully, but some optional ones failed
    // This is provisional, and not used right now
    PipelineStatus["Degraded"] = "degraded";
})(PipelineStatus || (PipelineStatus = {}));
/*
 * Represents action statuses
 * - cached: the action was not run, as it has already been in the past and is unmodified
 * - errored: the action ran, but failed
 * - completed: the action ran successfully
 */
export var ActionStatus;
(function (ActionStatus) {
    ActionStatus["Cached"] = "cached";
    ActionStatus["Errored"] = "errored";
    ActionStatus["Completed"] = "completed";
    ActionStatus["Ignored"] = "ignored";
    ActionStatus["Started"] = "started";
})(ActionStatus || (ActionStatus = {}));
export var FilesetType;
(function (FilesetType) {
    FilesetType["Git"] = "git";
    FilesetType["HTTP"] = "http";
    FilesetType["Image"] = "docker";
    FilesetType["Local"] = "local";
    FilesetType["Scratch"] = "scratch";
})(FilesetType || (FilesetType = {}));
//# sourceMappingURL=model.js.map