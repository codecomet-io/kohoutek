import {bool, int, uint64} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import {
    SolveStatus,
    Vertex,
    VertexLog,
} from "codecomet-js/source/buildkit-port/client/graph.js"
import * as model from "./model.js";
import {ActionStatus, BuildActionsObject, BuildPipeline, ActionsInfo, Stack, User, Repository} from "./model.js";
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
    actionsObject: BuildActionsObject = {}
    actionsInfo: ActionsInfo = {
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
    actor: User = {
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

        if (this.actionsObject[log.Vertex].stdout == undefined) {
            this.actionsObject[log.Vertex].stdout = []
        }
        if (this.actionsObject[log.Vertex].stderr == undefined) {
            this.actionsObject[log.Vertex].stderr = []
        }
        let dt = Buffer.from(log.Data.toString(), "base64").toString("utf-8").trim()
        if (dt != "") {
            // Structured stack traces are transmitted in a data url form
            if (dt.startsWith("data:application/json;base64,")) {
                // Decode it, parse it
                let structured = JSON.parse(Buffer.from(dt.substring(dt.indexOf(",") + 1), "base64").toString("utf-8"))
                // Copy that over into a Structured type
                this.actionsObject[log.Vertex].stack = {
                    timestamp: Date.parse(log.Timestamp),
                    lineNumber: parseInt(structured.linenumber, 10) - 1,
                    exitCode: parseInt(structured.exitcode, 10),
                    command: structured.command,
                    // Source is double encoded, so, decode it, and split by line to facilitate accessing source[linenumber]
                    source: Buffer.from(structured.source, "base64").toString("utf-8").split("\n"),
                }
            } else if (log.Stream == 2){
                this.actionsObject[log.Vertex].stderr.push({
                    timestamp: Date.parse(log.Timestamp),
                    line: dt
                })
            } else {
                this.actionsObject[log.Vertex].stdout.push({
                    timestamp: Date.parse(log.Timestamp),
                    line: dt
                })
            }
        }

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

        // Some actions are hidden away - either CodeComet internal shenanigans, or actions authors who want to hide their own internal dance
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

        // Currently, BK leaks internal operations. The right solution is to finish replacing the default client with our own. Short term, very dirty hack by ignoring anything that starts with "[auth] "
        if (vertice.Name.startsWith("[auth] ")){
            return
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

        this.actionsInfo = this.parseActionsInfo(actionKeys, this.actionsObject)

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

    parseActionsInfo(actionKeys : string[], actionsObject : model.BuildActionsObject) : model.ActionsInfo {
        // Total is easy
        const total = actionKeys.length

        // Cached is easy
        const cached = actionKeys
            .filter((key) => actionsObject[key].cached)
            .length

        // Errored is easy
        const errored = actionKeys
            .filter((key) => actionsObject[key].error)
            .length

        // Not ran have not started
        const notRan = actionKeys
            .filter((key) => !actionsObject[key].started)
            .length

        // Ran have started, not cached, not errored, finished
        const ran = actionKeys
            .filter((key) =>
                actionsObject[key].started
                && !actionsObject[key].cached
                && !actionsObject[key].error
                && actionsObject[key].completed
            )
            .length

        // Interrupted has started, not cached, not errored, never finished
        const interrupted = actionKeys
            .filter((key) =>
                actionsObject[key].started
                && !actionsObject[key].cached
                && !actionsObject[key].error
                && !actionsObject[key].completed
            )
            .length

        return {
            total,
            cached,
            errored,
            notRan,
            ran,
            interrupted,
        }
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

// Purpose of this is to suck out the info out of console colored output
// Hang-on to your butt
function parseLogEntry(line){
    let prior = 0
    let original = line.line
    let hasCommand = false
    let hasOutput = false
    let command = ""
    let output = ""
    // Match colored console break points
    line.line.replace(/\x1B\x5B[a-z0-9]{3}/g, function(match, index, subject): string{
        // If first match, or empty slice, move on
        if (prior != 0 && (index-prior) != 0){
            // Get the string then, after a bit of cleanup
            let sub = subject.substring(prior, index).trim() // .trimLeft("▶").trim()
            if (sub.charAt(0) == "▶")
                sub = sub.substring(1).trim()
            // Anything in there?
            if (sub != ""){
                // If we saw a command prompt, then it is a command
                if (hasCommand){
                    command = sub
                    hasCommand = false
                }
                // If we saw an output prompt, then it is output (possibly multi line)
                if (hasOutput){
                    output += subject.substring(prior, index) // sub
                    // splices.push("out", output)
                    // hasOutput = false
                }
                // Have a command prompt, mark it
                if (sub.trim() == "command"){
                    hasCommand = true
                }
                // Have an output prompt, mark it
                if (sub.trim() == "output"){
                    hasOutput = true
                }
            }
        }
        // Seek
        prior = index + match.length
        // Whatever
        return ""
    })
    // Get the tail part and consolidate the output
    let tail = original.substring(prior).trim()
    let plain = ""
    if (hasOutput)
        output += original.substring(prior).trim()

    if (!original.match(/^\x1B\x5B[a-z0-9]{3}$/)){
        if (!command)
            plain = original
    }

    return {
        timestamp: line.timestamp,
        command: command,
        output: output,
        plain: plain
    }
        // throw "tantrum"
        /*
        line.line = line.line.replace(/\x5B[a-z0-9]+[\x1B]+/g, "")
        for (let x = 0; x < 20; x++)
            console.warn("ERR", line.timestamp, line.line.charCodeAt(x), line.line.charAt(x))

         */
}

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

                if (solveStatus.Vertexes) {
                    solveStatus.Vertexes.forEach(this.build.addVertex.bind(this.build))
                }

                if (solveStatus.Logs) {
                    solveStatus.Logs.forEach(this.build.addLog.bind(this.build))
                }

            } catch(e) {
                Sentry.captureException(e, {
                    extra: {
                        data: data
                    }
                })
            }
        })

        // Sort the logs and process them into something manageable
        // let logs = {}
        Object.values(this.build.actionsObject).forEach(function(action){
            // Sort stdout
            if (action.stdout) {
                action.stdout.sort(function (line1, line2) {
                    return line1.timestamp < line2.timestamp ? -1 : 1;
                })
            }
            // Sort stderr
            if (action.stderr) {
                action.stderr.sort(function (line1, line2) {
                    return line1.timestamp < line2.timestamp ? -1 : 1;
                })
            }
            // If we have anything in there
            if (action.stdout) {
                // Final form
                let restructured: model.LogLog[] = []
                // Look into stderr
                action.stderr.forEach(function (line) {
                    // If we have a stack trace, just get anything BEFORE
                    if (!action.stack || action.stack.timestamp > line.timestamp){
                        // Get the processed form of stderr
                        let ret = parseLogEntry(line)
                        // Geeeeeeez timestamps are not reliable - stdout may be off by a millisec...
                        let stdout = null

                        // GEEEEEEZZZ
                        let magic = ret.output.split("\n")
                        let moreMagic = magic.shift()
                        let magicWithAKick = magic.join("\n")
                        if (magicWithAKick === "")
                            stdout = action.stdout.shift()

                        // Stuff it into our LogLog entry
                        if (!ret.plain || restructured.length == 0 ){
                            restructured.push({
                                command: ret.command,
                                resolved: moreMagic,
                                timestamp: ret.timestamp,
                                stdout: stdout ? stdout.line : "",
                                stderr: magicWithAKick,
                                exitCode: 0,
                            })
                        }else if (ret.plain != "."){
                            try {
                                restructured[restructured.length - 1 ].stderr = ret.plain
                            }catch(e){
                                console.warn("WTF", ret, restructured.length)
                            }
                        }
                    }
                })
                action.logAssembly = restructured
            }
            // Fix action stack...
            if (action.stack)
                action.logAssembly[action.logAssembly.length - 1].exitCode = action.stack.exitCode

        })

        /*
        Object.values(this.build.actionsObject).forEach(function(action){
            console.warn(JSON.stringify(action.logAssembly, null, 2))
        })
         */

        // post-processing and sending to callback
        this.build.wrap()

        // Sentry transaction done
        transaction.finish()

        return this.build
    }
}
