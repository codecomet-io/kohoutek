import {bool, int, uint64} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";
import {digest} from "codecomet-js/source/buildkit-port/dependencies/opencontainers/go-digest.js";
import {Types} from "codecomet-js/source/protobuf/types.js";
import  * as os from "node:os"

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
export type User = {
    id: string
    name: string
    // XXX signatures?
    // gpg: string
}

/*
 * A runner is a machine able to run CodeComet pipelines.
 * Right now this is being initialized with details from the machine running this script
 */
export class Host {
    // A unique identifier
    id: string //  = "uuid1233445"

    // Provisional: free form labels
    metadata: {
        [key: string]: string
    }
    /*= {
        nickname: "macRaccoon",
        description: "lalalala",
        grouptag: "red-team",
        random: "joke"
    }*/

    constructor(id: string, meta: {[key: string]: string}){
        this.id = id
        this.metadata = meta
    }

    // runtime information
    runtime: {[key: string]: string | undefined} = process.versions

    system: {
        arch: string,
        cpus: any[],
        endianness: string,
        freemem: int,
        home: string,
        hostname: string,
        loadavg: number[],
        networkInterfaces: {[key: string]: any},
        platform: string,
        release: string,
        tmpdir: string,
        totalmem: number,
        type: string,
        uptime: number,
        userInfo: {[key: string]: any},
        version: string
    } = {
        arch: os.arch(),
        cpus: os.cpus(),
        endianness: os.endianness(),
        freemem: os.freemem(),
        home: os.homedir(),
        hostname: os.hostname(),
        loadavg: os.loadavg(),
        networkInterfaces: os.networkInterfaces(),
        platform: os.platform(),
        release: os.release(),
        tmpdir: os.tmpdir(),
        totalmem: os.totalmem(),
        type: os.type(),
        uptime: os.uptime(),
        userInfo: os.userInfo(),
        version: os.version()
    }

    owner: User = <User>{
        id: "spacedub",
        name: "Space Raccoon"
    }
}

export type Repository = {
    commit: string
    author: string
    parent: string
    dirty: bool
    location: string
}

// usage: process.resourceUsage(),

/*
 * PipelineStatus represents the completion status of the plan.
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

export type ActionsInfo = {
    // Total number of tasks
    total: int
    // How many were cached
    cached: int
    // How many ran success
    ran: int
    // How many ran error
    errored: int
    // How many started but got interrupted
    interrupted: int
    // How many did not run
    notRan: int
}

/**
 * A Pipeline represents a DAG of actions that are meant to be ran together in order
 * The object here will hold individual tasks, and also a pre-computed report
 */
type GeneralPipeline = {
    // The unique, never changing identifier of a pipeline - should be the git source and codecomet plan file
    id: string

    // User chosen short name for the pipeline. Example: "My Pipeline for Netlify"
    name: string

    // User defined description for the plan. Example: "This pipeline is doing fancy and boo"
    description: string

    // Digest uuid of the run
    runID: string
    // This means: when did the first task start?
    // Starting time
    started: uint64 //string
    // time at which the last task that did complete actually finished
    completed: uint64 // string
    // See status type
    status: PipelineStatus
    // The total number of seconds between the first task starting and the last task finishing
    runtime: int
    // actual CPU time
    machineTime: int

    // Helpers providing high-level data about the tasks
    actionsInfo: ActionsInfo

    // Repository data
    repository?: Repository

    // Trigger: "manual" or pull request identifier
    trigger: string

    // User or entity that triggered the pipeline
    actor: User

    // Host executing the pipeline
    host?: Host
}

export interface BuildPipeline extends GeneralPipeline {
    actionsObject: BuildActionsObject
}

export type BuildActionsObject = {
    [key: digest.Digest]: BuildAction
}

export interface Pipeline extends GeneralPipeline {
    timingInfo: TimingInfo[]
    filesets: FilesetAction[]
    actions: Action[]
}

type LogLine  = {
    timestamp: int
    line: string
}

export type AssembledLog = {
    timestamp: uint64
    command: string
    resolved: string
    stdout: string
    stderr: string
    exitCode: uint64
}

export type GroupedLogsPayload = {
    commands: GroupedLogs[]
    totalLines: uint64
}

export type GroupedLogs = {
    id: string
    command: string
    resolved: string
    exitCode: uint64
    logs: ParsedLog[]
}

export type ParsedLog = {
    timestamp: uint64
    isStderr?: boolean
    lines: string[]
}

export type Stack = {
    timestamp: int
    lineNumber: uint64
    exitCode: uint64
    command: string
    source: string[]
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

export interface MakeDirectoryAction extends UtilityAction {
    type: 'makeDirectory'
    utilityName: 'make directory'
}

export interface MoveBuildAction extends UtilityBuildAction {
    type: 'move'
    utilityName: 'move'
}

export interface MoveAction extends UtilityAction {
    type: 'move'
    utilityName: 'move'
}

export interface AddFileBuildAction extends UtilityBuildAction {
    type: 'addFile'
    utilityName: 'add file'
}

export interface AddFileAction extends UtilityAction {
    type: 'addFile'
    utilityName: 'add file'
}

export interface PatchBuildAction extends UtilityBuildAction {
    type: 'patch'
    utilityName: 'patch'
}

export interface PatchAction extends UtilityAction {
    type: 'patch'
    utilityName: 'patch'
}

export interface CreateSymbolicLinkBuildAction extends UtilityBuildAction {
    type: 'createSymbolicLink'
    utilityName: 'create symbolic link'
}

export interface CreateSymbolicLinkAction extends UtilityAction {
    type: 'createSymbolicLink'
    utilityName: 'create symbolic link'
}

export interface MergeBuildAction extends UtilityBuildAction {
    type: 'merge'
    utilityName: 'merge'
}

export interface MergeAction extends UtilityAction {
    type: 'merge'
    utilityName: 'merge'
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
