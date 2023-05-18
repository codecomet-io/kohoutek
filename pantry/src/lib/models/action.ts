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
