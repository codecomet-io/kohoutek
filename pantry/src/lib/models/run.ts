/*
 * RunStatus represents the completion status of the run
 * Possible values are:
 * - errored: an action failed
 * - cancelled: the run was interrupted (by the user, or the process has been otherwise killed)
 * - completed: all actions succesfully returned and the run has completed
 */
export enum RunStatus {
    // At least one non optional task errored out
    Errored = 'errored',
    // The plan was interrupted (user interrupt, crash, network shutdown, poney, whatever)
    Cancelled = 'cancelled',
    // All tasks returned succesfully
    Completed = 'completed',
    // All non-optional tasks returned successfully, but some optional ones failed
    // This is provisional, and not used right now
    Degraded = 'degraded',
}
