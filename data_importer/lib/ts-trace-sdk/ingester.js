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
        this.tasks = {
            total: 0,
            cached: 0,
            ran: 0,
            errored: 0,
            interrupted: 0,
            notRan: 0,
        };
        this.repository = {
            commit: "",
            author: "",
            parent: "",
            dirty: false,
            location: "",
        };
        this.trigger = "manual";
        this.actor = {
            id: "spacedub",
            name: "Space Raccoon"
        };
        this.node = new model.Host("host-unique-id", {
            label1: "foo",
            label2: "bar",
        });
        // Actual list of tasks
        this.tasksPool = {};
    }
    addLog(log) {
        if (this.tasksPool[log.Vertex] == null)
            throw new Error("Logs without a registered vertex - panic");
        if (!this.tasksPool[log.Vertex].stdout) {
            this.tasksPool[log.Vertex].stdout = "";
            this.tasksPool[log.Vertex].stderr = "";
        }
        let dt = Buffer.from(log.Data.toString(), "base64").toString("utf-8").trim();
        // let dt = atob(log.Data.toString()).trim()
        if (dt != "")
            if (log.Stream == 2)
                this.tasksPool[log.Vertex].stderr += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n";
            else
                this.tasksPool[log.Vertex].stdout += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n";
        /*
        add.push(<LogEntry>{
            Timestamp: Date.parse(log.Timestampslack
            ),
            Content: atob(log.Data.toString())
        })
        */
    }
    addVertex(vertice) {
        if (!(vertice.Digest))
            throw new Error("Missing digest" + vertice);
        if (!vertice.Name)
            throw new Error("Missing name" + vertice);
        if (vertice.ProgressGroup && vertice.ProgressGroup.weak == true) {
            return;
            // this.tasksPool[vertice.Digest].progressGroup = vertice.ProgressGroup
            /*
            {
                id: vertice.ProgressGroup.id,
                name: vertice.ProgressGroup.name,
                weak: vertice.ProgressGroup.weak
            }
            */
        }
        if (this.tasksPool[vertice.Digest] == null) {
            let action = {
                id: vertice.Digest,
                name: vertice.Name,
                digest: vertice.Digest,
                cached: false,
                status: ActionStatus.NotRan,
            };
            if (vertice.Inputs)
                action.parents = vertice.Inputs.filter(function (idx) {
                    if (!(idx in this.tasksPool))
                        return;
                    return true;
                }.bind(this));
            this.tasksPool[vertice.Digest] = action;
        }
        if (vertice.Started) {
            this.tasksPool[vertice.Digest].started = Date.parse(vertice.Started);
            // this.tasksPool[vertice.Digest].datestamp = new Date(Date.parse(vertice.Started)).toISOString()
            if (!this.started || this.tasksPool[vertice.Digest].started < this.started) {
                this.started = this.tasksPool[vertice.Digest].started;
                // this.datestamp = new Date(this.timestamp).toISOString()
                // Temporary hack to create unique Descriptions for each Report - obviously needs to be undone
                this.description = "Some Pipeline"; //  + this.Report.Started.toString().slice(-4)
            }
            this.tasksPool[vertice.Digest].status = ActionStatus.Started;
        }
        if (vertice.Completed) {
            this.tasksPool[vertice.Digest].completed = Date.parse(vertice.Completed);
            this.tasksPool[vertice.Digest].runtime = this.tasksPool[vertice.Digest].completed - this.tasksPool[vertice.Digest].started;
            this.tasksPool[vertice.Digest].status = ActionStatus.Completed;
        }
        if (vertice.Error) {
            this.tasksPool[vertice.Digest].error = vertice.Error;
            this.tasksPool[vertice.Digest].status = ActionStatus.Errored;
        }
        if (vertice.Cached) {
            this.tasksPool[vertice.Digest].cached = true;
            this.tasksPool[vertice.Digest].status = ActionStatus.Cached;
        }
    }
    wrap() {
        let plan = this;
        let tsk = this.tasksPool;
        // Total is easy
        plan.tasks.total = Object.keys(tsk).length;
        // Cached is easy
        plan.tasks.cached = Object.keys(tsk).filter(function (key) {
            return !!tsk[key].cached;
        }).length;
        // Errored is easy
        plan.tasks.errored = Object.keys(tsk).filter(function (key) {
            return !!tsk[key].error;
        }).length;
        // Not ran have not started
        plan.tasks.notRan = Object.keys(tsk).filter(function (key) {
            return !tsk[key].started;
        }).length;
        // Ran have started, not cached, not errored, finished
        plan.tasks.ran = Object.keys(tsk).filter(function (key) {
            return tsk[key].started && !tsk[key].cached && !tsk[key].error && tsk[key].completed;
        }).length;
        // Interrupted has started, not cached, not errored, never finished
        plan.tasks.interrupted = Object.keys(tsk).filter(function (key) {
            return tsk[key].started && !tsk[key].cached && !tsk[key].error && !tsk[key].completed;
        }).length;
        Object.keys(tsk).forEach(function (i9) {
            // If there is an errored task, that means... we errored
            if (tsk[i9].error)
                plan.status = model.PipelineStatus.Errored;
            // If there is a not completed task, and we have NOT errored, it means we got cancelled
            if (!tsk[i9].completed && plan.status != model.PipelineStatus.Errored)
                plan.status = model.PipelineStatus.Cancelled;
            // If there is a more recent finish time, use it
            if (!plan.completed || tsk[i9].completed > plan.completed)
                plan.completed = tsk[i9].completed;
        });
        let mt = 0;
        Object.keys(tsk).forEach(function (i9) {
            if (tsk[i9].completed && tsk[i9].started)
                mt += tsk[i9].completed - tsk[i9].started;
        });
        plan.machineTime = mt;
        plan.runtime = plan.completed - plan.started;
        // FakeID it for now
        plan.runID = "sha256:" + createHash('sha256')
            .update(Math.random().toString())
            .digest('hex');
    }
}
/**
 * Consume a ReadStream and marshal a stream of JSON buildkit graph objects into our data model
 */
export class StdinIngester {
    //    constructor(file: ReadStream, onfinish: (plan: model.Pipeline, tasksc: model.ActionInstance[])=>void){
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
            let tsk = bd.tasksPool;
            bd.tasksPool = {};
            onfinish(bd, tsk); // Object.values(tsk))
        });
    }
}
export class BuffIngester {
    constructor() {
        this.build = new Build();
    }
    ingest(buff /*, onfinish: (plan: model.Pipeline, tasksc: model.TasksPool)=>void*/) {
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
        // let tsk = bd.tasksPool
        // bd.tasksPool = {}
        return bd; //, tsk]
        // onfinish(<Pipeline>bd, tsk) // Object.values(tsk))
    }
}
//# sourceMappingURL=ingester.js.map