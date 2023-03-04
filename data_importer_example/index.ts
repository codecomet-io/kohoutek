import type {ActionInstance} from "../data_importer/lib/ts-trace-sdk/model.js";
import {ActionStatus} from "../data_importer/lib/ts-trace-sdk/model.js";
import Pantry from "../data_importer/entrypoint.js";
import {readFileSync} from "fs";


async function run() {
    // Retrieve the protobuf definition and the trace file from wherever they are (XHR, file)
    // Here, just lazily readfilesync them
    let buff = readFileSync("../data_importer/mocks/simple-debian/llb.proto")
    let trace = readFileSync("../data_importer/mocks/simple-debian/no-cache.json")

    // Get the pipeline and the tasks from Pantry
    let [aPipeline, tasks] = await Pantry(buff, trace, "{}")

    // Some stuff about the pipeline:
    console.warn("Pipeline:")
    console.warn(aPipeline.id)
    console.warn(aPipeline.name)
    console.warn(aPipeline.description)

    // Tasks
    Object.values(tasks).forEach(function (tsk: ActionInstance) {
        console.warn("Task digest:", tsk.digest)
        console.warn("Task name:", tsk.name)
        switch (tsk.status) {
            case ActionStatus.Cached:
                console.warn("Task was cached")
                break
            case ActionStatus.NotRan:
                console.warn("Task did not run")
                break
            case ActionStatus.Errored:
                console.warn("Task errored")
                break
            case ActionStatus.Completed:
                console.warn("Task ran and completed")
                break
            case ActionStatus.Started:
                console.warn("Task started but was interrupted")
                break
        }
        if ([ActionStatus.Errored, ActionStatus.Completed, ActionStatus.Started, ActionStatus.Cached].indexOf(tsk.status) !== -1) {
            console.warn("Time when the task started", tsk.started)
            console.warn("Time when it ended", tsk.completed)
        } else {
            console.warn("Task never started...")
        }
        console.warn("Task parents:", tsk.parents)
        if (tsk.progressGroup) {
            console.warn("Should Ignore?", tsk.progressGroup.weak)
        }
        // to lookup parents from id:
        // tasks[digestId]
    })
}

run()
