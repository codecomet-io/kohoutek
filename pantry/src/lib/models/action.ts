import type { digest } from 'codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js';
import type { int, uint64 } from 'codecomet-js/source/buildkit-port/dependencies/golang/mock.js';
import type { Types } from 'codecomet-js/source/protobuf/types.js';

import type { Stack, LogLine, AssembledLog, GroupedLogsPayload } from './logs.js';
/*
 * Represents action statuses
 * - cached: the action was not run, as it has already been in the past and is unmodified
 * - errored: the action ran, but failed
 * - completed: the action ran successfully
 */
export enum ActionStatus {
    Cached    = 'cached',
    Errored   = 'errored',
    Completed = 'completed',
    Ignored   = 'ignored',
    Started   = 'started',
    Cancelled = 'cancelled',
}

type GeneralAction = {
	id            : string;
	name          : string;
	digest        : digest.Digest;
	started       : uint64;
	completed     : uint64;
	runtime       : int;
	cached        : boolean;
	error         : string;
	status        : ActionStatus;
	stack         : Stack;
	progressGroup : Types.ProgressGroup;
	type          : ActionType;
}

export interface BuildAction extends GeneralAction {
	buildParents? : digest.Digest[];
	stdout        : LogLine[];
	stderr        : LogLine[];
	assembledLogs : AssembledLog[];
}

export interface Action extends GeneralAction {
	parents?     : ParentAction[];
	groupedLogs? : GroupedLogsPayload;
}

export type ParentAction = {
	id   : string;
	name : string;
}

export type ActionType =
	| UtilityActionType
	| 'custom'
	| 'fileset'
    ;

type UtilityActionType =
	| 'utility'
	| 'merge'
	| 'copy'
	| 'makeDirectory'
	| 'addFile'
	| 'move'
	| 'createSymbolicLink'
	| 'patch'
    ;

export interface UserBuildAction extends BuildAction {
	type : 'custom';
}

export interface UserAction extends Action {
	type : 'custom';
}

type UtilityBaseAction = {
	utilityName : string;
}

export interface UtilityBuildAction extends BuildAction, UtilityBaseAction {
	type : UtilityActionType;
}

export interface UtilityAction extends Action, UtilityBaseAction {
	type : UtilityActionType;
}

export interface MakeDirectoryBuildAction extends UtilityBuildAction {
	type        : 'makeDirectory';
	utilityName : 'make directory';
}

export interface MoveBuildAction extends UtilityBuildAction {
	type        : 'move';
	utilityName : 'move';
}

export interface AddFileBuildAction extends UtilityBuildAction {
	type        : 'addFile';
	utilityName : 'add file';
}

export interface PatchBuildAction extends UtilityBuildAction {
	type        : 'patch';
	utilityName : 'patch';
}

export interface CreateSymbolicLinkBuildAction extends UtilityBuildAction {
	type        : 'createSymbolicLink';
	utilityName : 'create symbolic link';
}

export interface MergeBuildAction extends UtilityBuildAction {
	type        : 'merge';
	utilityName : 'merge';
}

export interface CopyBuildAction extends UtilityBuildAction {
	type        : 'copy';
	utilityName : 'copy';
}

type FilesetBaseAction = {
	filesetType     : FilesetType;
	source          : string;
	link?           : string;
	// ImageFileset
	forceResolve?   : boolean;
	architecture?   : string;
	variant?        : string;
	// GitFileset
	keepDir?        : boolean;
	// HTTPFileset
	checksum?       : string;
	filename?       : string;
	// LocalFileset
	includePattern? : string[];
	excludePattern? : string[];
}

export interface FilesetBuildAction extends BuildAction, FilesetBaseAction {
	type : 'fileset';
}

export interface FilesetAction extends Action, FilesetBaseAction {
	type : 'fileset';
}

export enum FilesetType {
	Git     = 'git',
	HTTP    = 'http',
	Image   = 'docker',
	Local   = 'local',
	Scratch = 'scratch',
}
