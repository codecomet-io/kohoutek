/*
 * RunStatus represents the completion status of the run
 * Possible values are:
 * - errored: an action failed
 * - cancelled: the run was interrupted (by the user, or the process has been otherwise killed)
 * - completed: all actions succesfully returned and the run has completed
 */
export var RunStatus;
(function (RunStatus) {
    // At least one non optional task errored out
    RunStatus["Errored"] = "errored";
    // The plan was interrupted (user interrupt, crash, network shutdown, poney, whatever)
    RunStatus["Cancelled"] = "cancelled";
    // All tasks returned succesfully
    RunStatus["Completed"] = "completed";
    // All non-optional tasks returned successfully, but some optional ones failed
    // This is provisional, and not used right now
    RunStatus["Degraded"] = "degraded";
})(RunStatus = RunStatus || (RunStatus = {}));
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
    ActionStatus["Cancelled"] = "cancelled";
})(ActionStatus = ActionStatus || (ActionStatus = {}));
//# sourceMappingURL=run.js.map