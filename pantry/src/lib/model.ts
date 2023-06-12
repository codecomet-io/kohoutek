// re-export
export * from './models/pipeline.js';
export * from './models/run.js';
export * from './models/action.js';
export * from './models/logs.js';
export * from './models/host.js';
export * from './models/user.js';

/**
 * IMPORTANT NOTES
 *
 * 1. Timing information are subject to caution:
 * - a certain task may take a largely different amount of time if ran in parallel with tasks that may or may not be cached
 * - a certain task ran on different machines will take vastly different time
 * Clearly we do need node-information per-task:
 * - number of core
 * - cputype
 * - memory
 * - load
 * And we also need parallelism info, or at the very least, a way to correct the "weight" a task based on plan timing info
 *
 * 2. Tasks currently do not have a satisfying identifier information:
 * - "name" is purely at the discretion of the user, and can very well be used by different tasks
 * - "digest" reflects the task content - as such it will change with even minor changes to the task itself
 * - ideally, we would have a unique identifier mechanism that does not change with task changing but that is also unique
 * across an organization
 *
 * 3. We currently miss any form of:
 * - user information - "who" triggered the build?
 * - we do not have information about the context - which Github repository, which commit, where does the plan come from
 */
