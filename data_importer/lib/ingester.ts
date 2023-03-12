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
    actionsInfo = {
        total: 0,
        cached: 0,
        ran: 0,
        errored: 0,
        interrupted: 0,
        notRan: 0,
    }
    // disable repository output for now
    // it leaks info and isn't currently needed
    // repository = {
    //     commit: "",
    //     author: "",
    //     parent: "",
    //     dirty: false,
    //     location: "",
    // }
    actor = {
        id: "spacedub",
        name: "Space Raccoon"
    }
    // disable host output for now
    // it creates a lot of noise and isn't currently needed
    // host = new model.Host("host-unique-id", {
    //     label1: "foo",
    //     label2: "bar",
    // })

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
            let action = <model.BuildAction>{
                id: vertice.Digest,
                name: vertice.Name,
                digest: vertice.Digest,
                cached: false,
                status: ActionStatus.Ignored,
            }

            if (vertice.Inputs) {
                action.buildParents = vertice.Inputs
            }

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

    wrap() {
        const actionKeys = Object.keys(this.actionsObject)
        // Total is easy
        this.actionsInfo.total = actionKeys.length
        // Cached is easy
        this.actionsInfo.cached = actionKeys
            .filter((key) => this.actionsObject[key].cached)
            .length
        // Errored is easy
        this.actionsInfo.errored = actionKeys
            .filter((key) => this.actionsObject[key].error)
            .length
        // Not ran have not started
        this.actionsInfo.notRan = actionKeys
            .filter((key) => !this.actionsObject[key].started)
            .length
        // Ran have started, not cached, not errored, finished
        this.actionsInfo.ran = actionKeys
            .filter((key) =>
                this.actionsObject[key].started
                && !this.actionsObject[key].cached
                && !this.actionsObject[key].error
                && this.actionsObject[key].completed
            )
            .length
        // Interrupted has started, not cached, not errored, never finished
        this.actionsInfo.interrupted = actionKeys
            .filter((key) =>
                this.actionsObject[key].started
                && !this.actionsObject[key].cached
                && !this.actionsObject[key].error
                && !this.actionsObject[key].completed
            )
            .length

        // if any action errored, the pipeline errored
        if (actionKeys.some((key) => this.actionsObject[key].error)) {
            this.status = model.PipelineStatus.Errored
        } else if (!actionKeys.some((key) => this.actionsObject[key].completed)) { // if any action didn't complete, and we have NOT errored, it means we got cancelled
            this.status = model.PipelineStatus.Cancelled
        }

        actionKeys.forEach((key) => {
            // If there is a more recent finish time, use it
            if (!this.completed || this.actionsObject[key].completed > this.completed) {
                this.completed = this.actionsObject[key].completed
            }
        })

        let mt: int = 0

        actionKeys
            .filter((key) => this.actionsObject[key].started && this.actionsObject[key].completed)
            .forEach((key) => mt += this.actionsObject[key].completed - this.actionsObject[key].started)

        this.machineTime = mt
        this.runtime = this.completed - this.started

        // FakeID it for now
        this.runID = 'sha256:' + createHash('sha256')
            .update(Math.random().toString())
            .digest('hex')

    }
}


/**
 * Consume a ReadStream and marshal a stream of JSON buildkit graph objects into our data model
 */
// export class StdinIngester {
//     private reader: readline.Interface
//     private build: Build

//     constructor(file: ReadStream, onfinish: (plan: model.BuildPipeline, tasksc: model.BuildActionsObject)=>void){
//         let transaction = Sentry.startTransaction({
//             op: "Ingester",
//             name: "Data ingesting transaction",
//         })

//         this.reader = readline.createInterface(file)

//         this.build = new Build()

//         this.reader.on('line', (data : string) => {
//             if (data.trim() === '')
//                 return

//             let solveStatus: SolveStatus

//             try {
//                 solveStatus = <SolveStatus>JSON.parse(data)

//                 if (solveStatus.Logs) {
//                     solveStatus.Logs.forEach(this.build.addLog.bind(this.build))
//                 }

//                 if (solveStatus.Vertexes) {
//                     solveStatus.Vertexes.forEach(this.build.addVertex.bind(this.build))
//                 }
//             } catch(e) {
//                 console.error("Failed to marshal JSON data into object. Exception was", e, "and data was:", data)

//                 Sentry.captureException(e, {
//                     extra: { data }
//                 })
//             }
//         })

//         this.reader.on('close', () => {
//             // Post-processing and sending to callback
//             this.build.wrap()

//             // Sentry transaction done
//             transaction.finish()

//             this.build.actionsObject = {}

//             onfinish(<BuildPipeline>this.build, this.build.actionsObject)
//         })
//     }
// }

export class BuffIngester {
    private build: Build

    constructor() {
        this.build = new Build()
    }

    ingest(buff: Buffer) : BuildPipeline {
        let transaction = Sentry.startTransaction({
            op: "Ingester",
            name: "Data ingesting transaction",
        })

        buff.toString().split('\n').forEach((data) => {
            // resist badly formated lines
            if (data.trim() == '')
                return

            let solveStatus : SolveStatus

            try {
                solveStatus = <SolveStatus>JSON.parse(data)

                if (solveStatus.Logs) {
                    solveStatus.Logs.forEach(this.build.addLog.bind(this.build))
                }

                if (solveStatus.Vertexes) {
                    solveStatus.Vertexes.forEach(this.build.addVertex.bind(this.build))
                }
            } catch(e) {
                console.error("Failed to marshal JSON data into object. Exception was", e, "and data was", data)

                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                })
            }
        })

        // post-processing and sending to callback
        this.build.wrap()

        // Sentry transaction done
        transaction.finish()

        return this.build
    }
}
