import { __awaiter, __generator } from "tslib";
import { ActionStatus } from "../data_importer/lib/ts-trace-sdk/model.js";
import Pantry from "../data_importer/entrypoint.js";
import { readFileSync } from "fs";
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var buff, trace, _a, aPipeline, tasks;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    buff = readFileSync("../data_importer/mocks/simple-debian/llb.proto");
                    trace = readFileSync("../data_importer/mocks/simple-debian/success-fragment.json");
                    return [4 /*yield*/, Pantry(buff, trace, "{}")
                        // Some stuff about the pipeline:
                    ];
                case 1:
                    _a = _b.sent(), aPipeline = _a[0], tasks = _a[1];
                    // Some stuff about the pipeline:
                    console.warn("Pipeline:");
                    console.warn(aPipeline.id);
                    console.warn(aPipeline.name);
                    console.warn(aPipeline.description);
                    // Tasks
                    Object.values(tasks).forEach(function (tsk) {
                        console.warn("Task digest:", tsk.digest);
                        console.warn("Task name:", tsk.name);
                        switch (tsk.status) {
                            case ActionStatus.Cached:
                                console.warn("Task was cached");
                                break;
                            case ActionStatus.NotRan:
                                console.warn("Task did not run");
                                break;
                            case ActionStatus.Errored:
                                console.warn("Task errored");
                                break;
                            case ActionStatus.Completed:
                                console.warn("Task ran and completed");
                                break;
                            case ActionStatus.Started:
                                console.warn("Task started but was interrupted");
                                break;
                        }
                        if (tsk.status in [ActionStatus.Errored, ActionStatus.Completed, ActionStatus.Started, ActionStatus.Cached]) {
                            console.warn("Time when the task started", tsk.started);
                            console.warn("Time when it ended", tsk.completed);
                        }
                        else {
                            console.warn("Task never started...");
                        }
                        console.warn("Task parents:", tsk.parents);
                        if (tsk.progressGroup) {
                            console.warn("Should Ignore?", tsk.progressGroup.weak);
                        }
                        // to lookup parents from id:
                        // tasks[digestId]
                    });
                    return [2 /*return*/];
            }
        });
    });
}
run();
//# sourceMappingURL=index.js.map