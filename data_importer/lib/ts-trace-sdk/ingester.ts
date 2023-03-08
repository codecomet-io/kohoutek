import {bool, int, uint64} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import {
    SolveStatus,
    Vertex,
    VertexLog,
} from "codecomet-js/source/buildkit-port/client/graph.js"
import * as model from "./model.js";
import { ActionStatus, BuildPipeline } from "./model.js";
import * as readline from 'node:readline/promises';
import {ReadStream} from "tty";

import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import {createHash} from "node:crypto";

class Build implements BuildPipeline {
    id = "github.com/codecomet-io/reporter-elastic/plan.js"
    name = "User defined name"
    description = "This is our super test plan, and guess what this description can change at any time"
    runID = ""
    started = 0
    completed = 0
    status = model.PipelineStatus.Completed
    runtime = 0
    machineTime = 0
    trigger = "manual"
    actionsObject = {}
    tasks = {
        total: 0,
        cached: 0,
        ran: 0,
        errored: 0,
        interrupted: 0,
        notRan: 0,
    }
    repository = {
        commit: "",
        author: "",
        parent: "",
        dirty: false,
        location: "",
    }
    actor = {
        id: "spacedub",
        name: "Space Raccoon"
    }
    node = new model.Host("host-unique-id", {
        label1: "foo",
        label2: "bar",
    })

    addLog(log: VertexLog) {
        if (this.actionsObject[log.Vertex] == null)
            throw new Error("Logs without a registered vertex - panic")

        if (!this.actionsObject[log.Vertex].stdout) {
            this.actionsObject[log.Vertex].stdout = ""
            this.actionsObject[log.Vertex].stderr = ""
        }
        let dt = Buffer.from(log.Data.toString(), "base64").toString("utf-8").trim()
        // let dt = atob(log.Data.toString()).trim()
        if (dt != "")
            if (log.Stream == 2)
                this.actionsObject[log.Vertex].stderr += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n"
            else
                this.actionsObject[log.Vertex].stdout += new Date(Date.parse(log.Timestamp)) + " " + dt.trim() + "\n"

        /*
        add.push(<LogEntry>{
            Timestamp: Date.parse(log.Timestampslack
            ),
            Content: atob(log.Data.toString())
        })
        */
    }

    addVertex(vertice: Vertex){
        if (!vertice.Digest) {
            throw new Error("Missing digest" + vertice)
        }

        if (!vertice.Name) {
            throw new Error("Missing name" + vertice)
        }

        if (vertice.ProgressGroup && vertice.ProgressGroup.weak == true) {
            return
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
            let action = <model.ActionInstance>{
                id: vertice.Digest,
                name: vertice.Name,
                digest: vertice.Digest,
                cached: false,
                status: ActionStatus.Ignored,
            }
            if (vertice.Inputs)
                action.parents = vertice.Inputs.filter(function(idx){
                    if (!(idx in this.actionsObject))
                        return
                    return true
                }.bind(this))
            this.actionsObject[vertice.Digest] = action
        }

        if (vertice.Started){
            this.actionsObject[vertice.Digest].started = Date.parse(vertice.Started)
            // this.actionsObject[vertice.Digest].datestamp = new Date(Date.parse(vertice.Started)).toISOString()
            if (!this.started || this.actionsObject[vertice.Digest].started < this.started) {
                this.started = this.actionsObject[vertice.Digest].started
                // this.datestamp = new Date(this.timestamp).toISOString()
                // Temporary hack to create unique Descriptions for each Report - obviously needs to be undone
                this.description = "Some Pipeline" //  + this.Report.Started.toString().slice(-4)
            }
            this.actionsObject[vertice.Digest].status = ActionStatus.Started
        }
        if (vertice.Completed){
            this.actionsObject[vertice.Digest].completed = Date.parse(vertice.Completed)
            this.actionsObject[vertice.Digest].runtime = this.actionsObject[vertice.Digest].completed - this.actionsObject[vertice.Digest].started
            this.actionsObject[vertice.Digest].status = ActionStatus.Completed
        }
        if (vertice.Error){
            this.actionsObject[vertice.Digest].error = vertice.Error
            this.actionsObject[vertice.Digest].status = ActionStatus.Errored
        }
        if (vertice.Cached) {
            this.actionsObject[vertice.Digest].cached = true
            this.actionsObject[vertice.Digest].status = ActionStatus.Cached
        }
    }

    wrap(){
        let plan = this
        let tsk = this.actionsObject
        // Total is easy
        plan.tasks.total = Object.keys(tsk).length
        // Cached is easy
        plan.tasks.cached = Object.keys(tsk).filter(function(key){
            return !!tsk[key].cached
        }).length
        // Errored is easy
        plan.tasks.errored = Object.keys(tsk).filter(function(key){
            return !!tsk[key].error
        }).length
        // Not ran have not started
        plan.tasks.notRan = Object.keys(tsk).filter(function(key){
            return !tsk[key].started
        }).length
        // Ran have started, not cached, not errored, finished
        plan.tasks.ran = Object.keys(tsk).filter(function(key){
            return tsk[key].started && !tsk[key].cached &&!tsk[key].error && tsk[key].completed
        }).length
        // Interrupted has started, not cached, not errored, never finished
        plan.tasks.interrupted = Object.keys(tsk).filter(function(key){
            return tsk[key].started && !tsk[key].cached &&!tsk[key].error && !tsk[key].completed
        }).length

        Object.keys(tsk).forEach(function(i9: string){
            // If there is an errored task, that means... we errored
            if (tsk[i9].error)
                plan.status = model.PipelineStatus.Errored
            // If there is a not completed task, and we have NOT errored, it means we got cancelled
            if (!tsk[i9].completed && plan.status != model.PipelineStatus.Errored)
                plan.status = model.PipelineStatus.Cancelled
            // If there is a more recent finish time, use it
            if (!plan.completed || tsk[i9].completed > plan.completed)
                plan.completed = tsk[i9].completed
        })

        let mt: int = 0
        Object.keys(tsk).forEach(function(i9: string){
            if (tsk[i9].completed && tsk[i9].started)
                mt += tsk[i9].completed - tsk[i9].started
        })
        plan.machineTime = mt
        plan.runtime = plan.completed - plan.started

        // FakeID it for now
        plan.runID = "sha256:" + createHash('sha256')
            .update(Math.random().toString())
            .digest('hex')

    }
}


/**
 * Consume a ReadStream and marshal a stream of JSON buildkit graph objects into our data model
 */
export class StdinIngester {
    private reader: readline.Interface
    private build: Build

//    constructor(file: ReadStream, onfinish: (plan: model.BuildPipeline, tasksc: model.ActionInstance[])=>void){
    constructor(file: ReadStream, onfinish: (plan: model.BuildPipeline, tasksc: model.ActionsObject)=>void){
        let transaction = Sentry.startTransaction({
            op: "Ingester",
            name: "Data ingesting transaction",
        });

        this.reader = readline.createInterface(file)

        let bd = this.build = new Build()

        this.reader.on("line", function(data: string){
            let d: SolveStatus
            if (data.trim() == "")
                return
            // We do resist badly formated lines
            try{
                d = <SolveStatus>JSON.parse(data)
                if (d.Logs) {
                    d.Logs.forEach(bd.addLog.bind(bd))
                }
                if (d.Vertexes) {
                    d.Vertexes.forEach(bd.addVertex.bind(bd))
                }
            }catch(e){
                console.error("Failed to marshal JSON data into object. Exception was", e, "and data was:", data)
                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                });
            }
        })

        this.reader.on("close", function(){
            // Post-processing and sending to callback
            bd.wrap()
            // Sentry transaction done
            transaction.finish();
            let tsk = bd.actionsObject
            bd.actionsObject = {}
            onfinish(<BuildPipeline>bd, tsk) // Object.values(tsk))
        })
    }
}

export class BuffIngester {
    private reader: readline.Interface
    private build: Build

    constructor(){
        this.build = new Build()
    }

    ingest(buff: Buffer /*, onfinish: (plan: model.BuildPipeline, tasksc: model.ActionsObject)=>void*/): BuildPipeline {
        let transaction = Sentry.startTransaction({
            op: "Ingester",
            name: "Data ingesting transaction",
        });


        let bd = this.build // = new Build()

        buff.toString().split("\n").forEach(function(data){
            if (data.trim() == "")
                return
            let d: SolveStatus
            // Resist badly formated lines
            try{
                d = <SolveStatus>JSON.parse(data)
                if (d.Logs) {
                    d.Logs.forEach(bd.addLog.bind(bd))
                }
                if (d.Vertexes) {
                    d.Vertexes.forEach(bd.addVertex.bind(bd))
                }
            }catch(e){
                console.error("Failed to marshal JSON data into object. Exception was", e, "and data was", data)
                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                });
            }
        })

        // Post-processing and sending to callback
        bd.wrap()
        // Sentry transaction done
        transaction.finish();
        // let tsk = bd.actionsObject
        // bd.actionsObject = {}
        return <BuildPipeline>bd //, tsk]
        // onfinish(<BuildPipeline>bd, tsk) // Object.values(tsk))
    }
}
