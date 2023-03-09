import * as model from "./model.js";
import { ActionStatus } from "./model.js";
import * as readline from 'node:readline/promises';
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { createHash } from "node:crypto";
class Build {
    constructor() {
        this.id = "github.com/codecomet-io/reporter-elastic/plan.js";
        this.name = "User defined name";
        this.description = "This is our super test plan, and guess what this description can change at any time";
        this.runID = "";
        this.started = 0;
        this.completed = 0;
        this.status = model.PipelineStatus.Completed;
        this.runtime = 0;
        this.machineTime = 0;
        this.trigger = "manual";
        this.actionsObject = {};
        this.actionsInfo = {
            total: 0,
            cached: 0,
            ran: 0,
            errored: 0,
            interrupted: 0,
            notRan: 0,
        };
        // disable repository output for now
        // it leaks info and isn't currently needed
        // repository = {
        //     commit: "",
        //     author: "",
        //     parent: "",
        //     dirty: false,
        //     location: "",
        // }
        this.actor = {
            id: "spacedub",
            name: "Space Raccoon"
        };
    }
    // disable host output for now
    // it creates a lot of noise and isn't currently needed
    // host = new model.Host("host-unique-id", {
    //     label1: "foo",
    //     label2: "bar",
    // })
    addLog(log) {
        if (this.actionsObject[log.Vertex] == null)
            throw new Error("Logs without a registered vertex - panic");
        if (!this.actionsObject[log.Vertex].stdout) {
            this.actionsObject[log.Vertex].stdout = "";
            this.actionsObject[log.Vertex].stderr = "";
        }
        let dt = Buffer.from(log.Data.toString(), "base64").toString("utf-8").trim();
        // let dt = atob(log.Data.toString()).trim()
        if (dt != "")
            if (log.Stream == 2)
                this.actionsObject[log.Vertex].stderr += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n";
            else
                this.actionsObject[log.Vertex].stdout += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n";
        /*
        add.push(<LogEntry>{
            Timestamp: Date.parse(log.Timestampslack
            ),
            Content: atob(log.Data.toString())
        })
        */
    }
    addVertex(vertice) {
        if (!vertice.Digest) {
            throw new Error("Missing digest" + vertice);
        }
        if (!vertice.Name) {
            throw new Error("Missing name" + vertice);
        }
        if (vertice.ProgressGroup && vertice.ProgressGroup.weak == true) {
            return;
            // this.actionsObject[vertice.Digest].progressGroup = vertice.ProgressGroup
            /*
            {
                id: vertice.ProgressGroup.id,
                name: vertice.ProgressGroup.name,
                weak: vertice.ProgressGroup.weak
            }
            */
        }
        if (!this.actionsObject[vertice.Digest]) {
            let action = {
                id: vertice.Digest,
                name: vertice.Name,
                digest: vertice.Digest,
                cached: false,
                status: ActionStatus.Ignored,
            };
            if (vertice.Inputs)
                action.parents = vertice.Inputs.filter(function (idx) {
                    if (!(idx in this.actionsObject))
                        return;
                    return true;
                }.bind(this));
            this.actionsObject[vertice.Digest] = action;
        }
        if (vertice.Started) {
            this.actionsObject[vertice.Digest].started = Date.parse(vertice.Started);
            // this.actionsObject[vertice.Digest].datestamp = new Date(Date.parse(vertice.Started)).toISOString()
            if (!this.started || this.actionsObject[vertice.Digest].started < this.started) {
                this.started = this.actionsObject[vertice.Digest].started;
                // this.datestamp = new Date(this.timestamp).toISOString()
                // Temporary hack to create unique Descriptions for each Report - obviously needs to be undone
                this.description = "Some Pipeline"; //  + this.Report.Started.toString().slice(-4)
            }
            this.actionsObject[vertice.Digest].status = ActionStatus.Started;
        }
        if (vertice.Completed) {
            this.actionsObject[vertice.Digest].completed = Date.parse(vertice.Completed);
            this.actionsObject[vertice.Digest].runtime = this.actionsObject[vertice.Digest].completed - this.actionsObject[vertice.Digest].started;
            this.actionsObject[vertice.Digest].status = ActionStatus.Completed;
        }
        if (vertice.Error) {
            this.actionsObject[vertice.Digest].error = vertice.Error;
            this.actionsObject[vertice.Digest].status = ActionStatus.Errored;
        }
        if (vertice.Cached) {
            this.actionsObject[vertice.Digest].cached = true;
            this.actionsObject[vertice.Digest].status = ActionStatus.Cached;
        }
    }
    wrap() {
        const actionKeys = Object.keys(this.actionsObject);
        // Total is easy
        this.actionsInfo.total = actionKeys.length;
        // Cached is easy
        this.actionsInfo.cached = actionKeys
            .filter((key) => this.actionsObject[key].cached)
            .length;
        // Errored is easy
        this.actionsInfo.errored = actionKeys
            .filter((key) => this.actionsObject[key].error)
            .length;
        // Not ran have not started
        this.actionsInfo.notRan = actionKeys
            .filter((key) => !this.actionsObject[key].started)
            .length;
        // Ran have started, not cached, not errored, finished
        this.actionsInfo.ran = actionKeys
            .filter((key) => this.actionsObject[key].started
            && !this.actionsObject[key].cached
            && !this.actionsObject[key].error
            && this.actionsObject[key].completed)
            .length;
        // Interrupted has started, not cached, not errored, never finished
        this.actionsInfo.interrupted = actionKeys
            .filter((key) => this.actionsObject[key].started
            && !this.actionsObject[key].cached
            && !this.actionsObject[key].error
            && !this.actionsObject[key].completed)
            .length;
        actionKeys.forEach((key) => {
            // If there is an errored task, that means... we errored
            if (this.actionsObject[key].error) {
                this.status = model.PipelineStatus.Errored;
            }
            else if (!this.actionsObject[key].completed) { // If there is a not completed task, and we have NOT errored, it means we got cancelled
                this.status = model.PipelineStatus.Cancelled;
            }
            // If there is a more recent finish time, use it
            if (!this.completed || this.actionsObject[key].completed > this.completed) {
                this.completed = this.actionsObject[key].completed;
            }
        });
        let mt = 0;
        actionKeys
            .filter((key) => this.actionsObject[key].started && this.actionsObject[key].completed)
            .forEach((key) => mt += this.actionsObject[key].completed - this.actionsObject[key].started);
        this.machineTime = mt;
        this.runtime = this.completed - this.started;
        // FakeID it for now
        this.runID = 'sha256:' + createHash('sha256')
            .update(Math.random().toString())
            .digest('hex');
    }
}
/**
 * Consume a ReadStream and marshal a stream of JSON buildkit graph objects into our data model
 */
export class StdinIngester {
    constructor(file, onfinish) {
        let transaction = Sentry.startTransaction({
            op: "Ingester",
            name: "Data ingesting transaction",
        });
        this.reader = readline.createInterface(file);
        let bd = this.build = new Build();
        this.reader.on("line", function (data) {
            let d;
            if (data.trim() == "")
                return;
            // We do resist badly formated lines
            try {
                d = JSON.parse(data);
                if (d.Logs) {
                    d.Logs.forEach(bd.addLog.bind(bd));
                }
                if (d.Vertexes) {
                    d.Vertexes.forEach(bd.addVertex.bind(bd));
                }
            }
            catch (e) {
                console.error("Failed to marshal JSON data into object. Exception was", e, "and data was:", data);
                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                });
            }
        });
        this.reader.on("close", function () {
            // Post-processing and sending to callback
            bd.wrap();
            // Sentry transaction done
            transaction.finish();
            let tsk = bd.actionsObject;
            bd.actionsObject = {};
            onfinish(bd, tsk); // Object.values(tsk))
        });
    }
}
export class BuffIngester {
    constructor() {
        this.build = new Build();
    }
    ingest(buff /*, onfinish: (plan: model.BuildPipeline, tasksc: model.ActionsObject)=>void*/) {
        let transaction = Sentry.startTransaction({
            op: "Ingester",
            name: "Data ingesting transaction",
        });
        let bd = this.build; // = new Build()
        buff.toString().split("\n").forEach(function (data) {
            if (data.trim() == "")
                return;
            let d;
            // Resist badly formated lines
            try {
                d = JSON.parse(data);
                if (d.Logs) {
                    d.Logs.forEach(bd.addLog.bind(bd));
                }
                if (d.Vertexes) {
                    d.Vertexes.forEach(bd.addVertex.bind(bd));
                }
            }
            catch (e) {
                console.error("Failed to marshal JSON data into object. Exception was", e, "and data was", data);
                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                });
            }
        });
        // Post-processing and sending to callback
        bd.wrap();
        // Sentry transaction done
        transaction.finish();
        // let tsk = bd.actionsObject
        // bd.actionsObject = {}
        return bd; //, tsk]
        // onfinish(<BuildPipeline>bd, tsk) // Object.values(tsk))
    }
}
//# sourceMappingURL=ingester.js.map