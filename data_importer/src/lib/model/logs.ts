import {int, uint64} from "codecomet-js/source/buildkit-port/dependencies/golang/mock.js";

export type LogLine  = {
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
