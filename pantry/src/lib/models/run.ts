import type { StringMap } from 'briznads-helpers';

import type { digest } from 'codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js';
import type { int, uint64 } from 'codecomet-js/source/buildkit-port/dependencies/golang/mock.js';

import type { Host } from './host.js';
import type { User } from './user.js';
import type { Pipeline } from './pipeline.js';
import type { BuildAction, FilesetAction, Action } from './action.js';


/*
 * RunStatus represents the completion status of the run
 * Possible values are:
 * - errored: an action failed
 * - cancelled: the run was interrupted (by the user, or the process has been otherwise killed)
 * - completed: all actions succesfully returned and the run has completed
 */
export enum RunStatus {
    // At least one non optional task errored out
    Errored   = 'errored',

    // The plan was interrupted (user interrupt, crash, network shutdown, poney, whatever)
    Cancelled = 'cancelled',

    // All tasks returned succesfully
    Completed = 'completed',

    // All non-optional tasks returned successfully, but some optional ones failed
    // This is provisional, and not used right now
    Degraded  = 'degraded',
}

/**
 * A Run represents a DAG of actions that are meant to be ran together in order
 * The object here will hold individual tasks, and also a pre-computed report
 */
type GeneralRun = {
	// generated nanoid of the run
	id                 : string;

	// unique name for the run. will be the last commit message, plus an indication if the current repo is dirty
	name               : string;

	pipeline           : Pipeline;

	// user defined free-form key value custom metadata
	metadata?          : StringMap;

	// Starting time, aka when did the first task start?
	started            : uint64; //string

	// time at which the last task that did complete actually finished
	completed          : uint64; // string

	// See status type
	status             : RunStatus;

	// The total number of milliseconds between the first task starting and the last task finishing
	runtime            : int;

	// actual CPU time
	machineTime        : int;

	// Helpers providing high-level data about the tasks
	stats              : RunStats;

	// if the run errored, the name of the first action that errored
	erroredActionName? : string;

	// Repository data
	repository?        : Repository;

	// Trigger         : "manual" or pull request identifier
	trigger            : 'manual' | string;

	// user or entity that triggered the run
	actor              : User;

	// Host executing the run
	host?              : Host;
}

export type RunStats = {
	// total number of tasks
	total                       : int;

	// how many were cached
	cached                      : int;

	// how many ran successfully; aka started, not cached, not errored, finished
	ran                         : int;

	// how many finished successfully; aka started, not errored, finished; aka cached + ran
	finishedSuccessfully        : int;

	// percent of how many of the total tasks finished successfully
	finishedSuccessfullyPercent : int;

	// percent of total tasks that were cached
	cachedPercent               : int;

	// how many errored
	errored                     : int;

	// how many started but got interrupted; aka started, not cached, not errored, never finished
	interrupted                 : int;

	// how many did not run
	notRan                      : int;
}

export interface BuildRun extends GeneralRun {
	actionsObject : BuildActionsObject;
}

export type BuildActionsObject = {
	[ key : digest.Digest ] : BuildAction;
}

export interface Run extends GeneralRun {
	timingInfo : TimingInfo[];
	filesets   : FilesetAction[];
	actions    : Action[];
}

export type TimingInfo = {
	id      : string;
	name    : string;
	runtime : number;
	percent : number;
	cached? : true;
}

export type Repository = {
	commit        : string;
	author        : string;
	parent        : string;
	isDirty       : boolean;
	location      : string;
	commitSubject : string;
}
