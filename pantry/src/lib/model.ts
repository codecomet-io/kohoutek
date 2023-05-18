import type { AnyMap, StringMap } from 'briznads-helpers';

import {bool, int, uint64} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import  * as os from "node:os";

import {RunStatus, ActionStatus} from "./model/run.js";
import {Stack, LogLine, AssembledLog, GroupedLogsPayload} from "./model/logs.js";

// Re-export
export * from "./model/run.js";
export * from "./model/logs.js";

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
 * And we also need parallelisism info, or at the very least, a way to correct the "weight" a task based on plan timing info
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

/*
 * A User represents a GitHub account
 */
type User = {
	id: string
	name: string
	// XXX signatures?
	// gpg: string
}

type HostSystem = {
	arch: string;
	cpus: any[];
	endianness: string;
	freemem: int;
	home: string;
	hostname: string;
	loadavg: number[];
	networkInterfaces: AnyMap;
	platform: string;
	release: string;
	tmpdir: string;
	totalmem: number;
	type: string;
	uptime: number;
	userInfo: AnyMap;
	version: string;
}

/*
 * A runner is a machine able to run CodeComet pipelines
 * Right now this is being initialized with details from the machine running this script
 */
export class Host {
	// A unique identifier
	id: string; //  = "uuid1233445"

	// free form labels
	metadata?: StringMap;


	constructor(id: string, meta: StringMap){
		this.id = id;
		this.metadata = meta;
	}


	// runtime information
	runtime?: {[key: string]: string | undefined} = process.versions;

	system? : HostSystem = {
		arch              : os.arch(),
		cpus              : os.cpus(),
		endianness        : os.endianness(),
		freemem           : os.freemem(),
		home              : os.homedir(),
		hostname          : os.hostname(),
		loadavg           : os.loadavg(),
		networkInterfaces : os.networkInterfaces(),
		platform          : os.platform(),
		release           : os.release(),
		tmpdir            : os.tmpdir(),
		totalmem          : os.totalmem(),
		type              : os.type(),
		uptime            : os.uptime(),
		userInfo          : os.userInfo(),
		version           : os.version(),
	};

	owner : User = {
		id   : "spacedub",
		name : "Space Raccoon",
	};
}

export type Repository = {
	commit: string
	author: string
	parent: string
	isDirty: bool
	location: string
	commitSubject: string
}

// usage: process.resourceUsage(),



export type RunStats = {
	// total number of tasks
	total: int

	// how many were cached
	cached: int

	// how many ran successfully; aka started, not cached, not errored, finished
	ran: int

	// how many finished successfully; aka started, not errored, finished; aka cached + ran
	finishedSuccessfully: int

	// percent of how many of the total tasks finished successfully
	finishedSuccessfullyPercent: int

	// percent of total tasks that were cached
	cachedPercent: int

	// how many errored
	errored: int

	// how many started but got interrupted; aka started, not cached, not errored, never finished
	interrupted: int

	// how many did not run
	notRan: int
}

/**
 * A Run represents a DAG of actions that are meant to be ran together in order
 * The object here will hold individual tasks, and also a pre-computed report
 */
type GeneralRun = {
	// generated nanoid of the run
	id: string

	// unique name for the run. will be the last commit message, plus an indication if the current repo is dirty
	name: string

	// generated nanoid of the pipeline
	pipelineId: string

	// the fully qualified name of the path to a CodeComet pipeline file within a git repo
	pipelineFqn: string

	// user chosen short name for the pipeline. Example: "My Pipeline for Netlify"
	pipelineName: string

	// user defined description for the plan. Example: "This pipeline is doing fancy and boo"
	description: string

	// user defined free-form key value custom metadata
	metadata?: StringMap

	// Starting time, aka when did the first task start?
	started: uint64 //string

	// time at which the last task that did complete actually finished
	completed: uint64 // string

	// See status type
	status: RunStatus

	// The total number of seconds between the first task starting and the last task finishing
	runtime: int

	// actual CPU time
	machineTime: int

	// Helpers providing high-level data about the tasks
	stats: RunStats

	// if the run errored, the name of the first action that errored
	erroredActionName?: string

	// Repository data
	repository?: Repository

	// Trigger: "manual" or pull request identifier
	trigger: string

	// user or entity id that triggered the run
	actorId: string

	// user or entity name that triggered the run
	actorName: string

	// Host executing the run
	host?: Host
}

export interface BuildRun extends GeneralRun {
	actionsObject: BuildActionsObject
}

export type BuildActionsObject = {
	[key: digest.Digest]: BuildAction
}

export interface Run extends GeneralRun {
	timingInfo: TimingInfo[]
	filesets: FilesetAction[]
	actions: Action[]
}


type GeneralAction = {
	id: string
	name: string
	digest: digest.Digest
	started: uint64
	completed: uint64
	runtime: int
	cached: bool
	error: string
	status: ActionStatus
	stack: Stack
	progressGroup: Types.ProgressGroup
	type: ActionType
}

export interface BuildAction extends GeneralAction {
	buildParents?: digest.Digest[]
	stdout: LogLine[]
	stderr: LogLine[]
	assembledLogs: AssembledLog[]
}

export interface Action extends GeneralAction {
	parents?: ParentAction[]
	groupedLogs?: GroupedLogsPayload
}

export type ParentAction = {
	id: string
	name: string
}

export type ActionType =
	| UtilityActionType
	| 'custom'
	| 'fileset'

type UtilityActionType =
	| 'utility'
	| 'merge'
	| 'copy'
	| 'makeDirectory'
	| 'addFile'
	| 'move'
	| 'createSymbolicLink'
	| 'patch'

export interface UserBuildAction extends BuildAction {
	type: 'custom'
}

export interface UserAction extends Action {
	type: 'custom'
}

type UtilityBaseAction = {
	utilityName : string
}

export interface UtilityBuildAction extends BuildAction, UtilityBaseAction {
	type: UtilityActionType
}

export interface UtilityAction extends Action, UtilityBaseAction {
	type: UtilityActionType
}

export interface MakeDirectoryBuildAction extends UtilityBuildAction {
	type: 'makeDirectory'
	utilityName: 'make directory'
}

export interface MoveBuildAction extends UtilityBuildAction {
	type: 'move'
	utilityName: 'move'
}

export interface AddFileBuildAction extends UtilityBuildAction {
	type: 'addFile'
	utilityName: 'add file'
}

export interface PatchBuildAction extends UtilityBuildAction {
	type: 'patch'
	utilityName: 'patch'
}

export interface CreateSymbolicLinkBuildAction extends UtilityBuildAction {
	type: 'createSymbolicLink'
	utilityName: 'create symbolic link'
}

export interface MergeBuildAction extends UtilityBuildAction {
	type: 'merge'
	utilityName: 'merge'
}

export interface CopyBuildAction extends UtilityBuildAction {
	type: 'copy'
	utilityName: 'copy'
}

type FilesetBaseAction = {
	filesetType: FilesetType
	source: string
	link?: string
	// ImageFileset
	forceResolve?: bool
	architecture?: string
	variant?: string
	// GitFileset
	keepDir?: bool
	// HTTPFileset
	checksum?: string
	filename?: string
	// LocalFileset
	includePattern?: string[]
	excludePattern?: string[]
}

export interface FilesetBuildAction extends BuildAction, FilesetBaseAction {
	type: 'fileset'
}

export interface FilesetAction extends Action, FilesetBaseAction {
	type: 'fileset'
}

export enum FilesetType {
	Git = 'git',
	HTTP = 'http',
	Image = 'docker',
	Local = 'local',
	Scratch = 'scratch',
}

export type TimingInfo = {
	id: string
	name: string
	runtime: number
	percent: number
	cached?: true
}
