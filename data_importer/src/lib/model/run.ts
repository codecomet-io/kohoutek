/*
 * PipelineStatus represents the completion status of the pipeline.
 * Possible values are:
 * - errored: an action failed
 * - cancelled: the pipeline was interrupted (by the user, or the process has been otherwise killed)
 * - completed: all actions succesfully returned and the pipeline has completed
 */
export enum PipelineStatus {
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

/*
 * Represents action statuses
 * - cached: the action was not run, as it has already been in the past and is unmodified
 * - errored: the action ran, but failed
 * - completed: the action ran successfully
 */
export enum ActionStatus {
    Cached = 'cached',
    Errored = 'errored',
    Completed = 'completed',
    Ignored = 'ignored',
    Started = 'started',
    Cancelled = 'cancelled'
}