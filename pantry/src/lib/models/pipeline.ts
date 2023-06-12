import type { NumberMap } from 'briznads-helpers';


type ActorsMap = {
	[ actorId : string ] : {
		name  : string;
		count : number;
	};
};

export type PipelineStats = {
	// total count of runs
	runCount : number;

	// duration of all runs
	machineTime : number;

	// count of all attempted actions for all runs
	actionsCount : number;

	// count of all cached actions for all runs
	cachedActionsCount : number;

	// count of all ran actions, aka not cached & completed successfully, for all runs
	ranActionsCount : number;

	// count of all completed actions, aka cached + ran, for all runs
	completedActionsCount : number;

	// count of all errored actions for all runs
	erroredActionsCount : number;

	// count of all interrupted actions - aka started, not cached, not errored, never finished - for all runs
	interruptedActionsCount : number;

	// count of how many actions didn't run for all runs
	notRanActionsCount : number;

	// map of run statuses, along with a count of each type
	statusesMap : NumberMap;

	// map of errored actions, along with a count of each type
	erroredActionsMap : NumberMap;

	// map of run triggers, along with a count of each type
	triggersMap : NumberMap;

	// map of run initiating actors, along with a count of each actor
	actorsMap : ActorsMap;
};

export interface Pipeline extends PipelineStats {
	// generated nanoid of the pipeline
	id : string;

	// the organization that owns the repo that contains the pipeline file
	org : string;

	// name of the git repo, including org, containing the pipeline file
	repo : string;

	// the fully qualified name of the path to a CodeComet pipeline file within a git repo
	fqn : string;

	// user chosen short name for the pipeline. Example: "My Pipeline for Netlify"
	name : string;

	// user defined description for the pipeline. Example: "This pipeline is doing fancy and boo"
	description : string;

	// epoch timestamp of the first run
	firstRunAt : number;

	// epoch timestamp of the last/most recent run
	lastRunAt : number;
}
