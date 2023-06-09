import type { Action, User } from './model.js';

import { RunStatus } from './model.js';


export class DataMocker {
	private names : string[] = [
		`add 2 examples of data object`,
		`Delete proposal.md`,
		`Create proposal.md`,
		`Horrific, this is horrific`,
		`save state`,
		`Atomic actions types`,
		`Specializing filesets`,
		`Fix bustage following taskPool tasksPool rename`,
		`Merge pull request #1 from codecomet-io/bm-ingester_improvements`,
		`put back the Digest value`,
		`add clarifying comment about build process`,
		`tasksID is redundant and unneeded; tasksPool is using the digest sha as an ID, so let's call it an ID; remove the previous`,
		`ID prefix`,
		`updated for accuracy`,
		`the key taskPool should align with the type name TasksPool`,
		`spell out cryptic var names`,
		`Merge branch 'main' of https://github.com/codecomet-io/pantry`,
		`update status terms`,
		`update gitignore to omit built files`,
		`Gen in static + actual data`,
		`Minimal instructions`,
		`Fix example and adding no cache pipe`,
		`data importer first shot`,
		`rename project to reflect context`,
		`wrap pantry ui project in own folder to live alongside data output project in pantry repo`,
		`save serialized output from real run log parser`,
		`add logo/favicon`,
		`highlight invoking action on hover/focus/click`,
		`parse time, date, and lapsed`,
		`update package name`,
		`componentize working pieces`,
		`include example object`,
		`include status for failed actions/pipelines`,
		`add concept of which action invokes another action`,
		`Fixed mocks + preliminary stacktrace and logs experiment`,
		`insure no parent action comes after a child`,
		`generate icon key using actual icon components for maintainability`,
		`forgot to commit built files`,
		`docker link parsing cleanup`,
		`Add more data mocks`,
		`Fix logs breaking the ingester + ignore spurious buildkit ops`,
		`Tranform Docker Hub urls properly`,
		`add ability to expand parent accordion when clicked`,
		`styling tweak of icon key text`,
		`update fileset status copy`,
		`create icon key popover`,
		`remove prepare fileset action`,
		`support gitlab icon for hosted filesets`,
		`force max width of 1280px while still looking beautiful`,
		`remove unnecessary entries from gitignore`,
		`Delete pantry-ui/build directory`,
		`Delete pantry-ui/.svelte-kit directory`,
		`show 0ms as default action run time`,
		`use friendlier utilityName`,
		`make sure to print "an hour" vs "a hour"`,
		`split up building pipelines from running the build, then opening the server`,
		`clean up old file`,
		`add link for linkable filesets`,
		`Tweak tweak`,
		`Updated mock data`,
		`improve build runner`,
		`rewrite lapsed time helper to support precision`,
		`make default action icon a fun little magnet`,
		`add better lint rules`,
		`build ui from generated json output`,
		`how I learned to stop worrying and love js arrow functions`,
		`distinguish between build pipeline with actions object and output pipeline with actions array`,
		`Fileset is 1 word`,
		`hovering tooltip should show atop focus tooltip`,
		`reduce bundle size by over 75% by including individual component imorts`,
		`remove invalid selector warning`,
		`cut up ViewLogs into multiple modular chunks`,
		`introduce state management`,
		`View logs (#9)`,
		`renaming for make better understand`,
		`Force update mocks again`,
		`Fix porting logs into typed object`,
		`Force update mocks`,
		`Preview tester`,
		`Vendorizing private lib`,
		`Fix broken processor`,
		`Merge pull request #8 from codecomet-io/custom-timing-chart`,
		`Merge branch 'main' into custom-timing-chart`,
		`add check that pipeline isn't undefined to allow successful build`,
		`Squashed commit of the following:`,
		`Fix ref bug`,
		`Shameful log implementation`,
		`insure no other links retain focus on hover`,
		`finalize timing chart`,
		`update chart color scheme`,
		`scroll to active accordion`,
		`fix indentation`,
		`add timing tooltip`,
		`save progress`,
		`first attempt`,
		`use hash and hashchange to expand accordion`,
		`componentize filesets or actions header`,
		`add pipeline info modal`,
		`add detail field component`,
		`if passed undefined time, return empty string`,
		`add title`,
		`commit built files`,
		`Apply suggestions from code review`,
		`Stack experiment + updated mock`,
		`add erroredActionName`,
		`turn on auth route protection`,
		`de-nest actor info for querying convenience`,
		`update auth conf to use app subdomain`,
		`Merge branch 'main' of https://github.com/codecomet-io/kohoutek`,
		`add global nav`,
		`save pipeline id`,
		`Hyakutake`,
		`remove accidental space in " pantry" dir`,
		`make README slightly prettier`,
		`update repo references`,
		`rename data_importer to pantry and pantry-ui to app`,
		`rename pipeline to run`,
		`rewrite routes to prepare for auth`,
		`parse name from last commit`,
		`Global nav starter (#12)`,
		`get pipeline from local or firestore document`,
		`save runs to Firestore db`,
		`don't commit built files`,
		`use centralized helper package; enforce lint rules`,
		`Ingester work`,
		`support copy action`,
		`add Copy action; remove unused references`,
		`better display log info on 1280+ screens`,
		`Mock mock`,
		`Debian with deug`,
		`break up ms into s & ms in timing tooltip`,
		`Fix cancelled actions`,
		`put content into appropriate grid slots`,
		`don't pass references to global vars`,
		`don't show all log pieces in tooltip if logging output is broken and fails to include expected pieces`,
		`import ion-popover`,
		`reduce timing chart percent decimals from 3 places to 2`,
		`More mocks`,
	];
	private trueFalse : boolean[] = [
		true,
		false,
	];
	private statuses : RunStatus[] = [
		RunStatus.Errored,
		RunStatus.Cancelled,
		RunStatus.Completed,
		RunStatus.Degraded,
	];
	private actorNames : string[] = [
		'colorfulpod',
		'bigheartedprefix',
		'privatething',
		'poisedstatute',
		'moralwatch',
		'tragicshorts',
		'otherparsley',
		'blankfacelift',
		'wigglydispatch',
		'parallelguestbook',
		'equatorialplough',
		'ornatebaggage',
		'quintessentialchicken',
		'saltycompany',
		'jampackedindustrialisation',
		'mammothgazelle',
		'frightenedunderwear',
		'deafeningsurrounds',
		'indelibleobi',
		'frizzysoutheast',
		'homelyrunaway',
		'utterbeyond',
		'querulousexchange',
		'serioushornet',
		'pinkbed',
		'shyflexibility',
		'defensivemeringue',
		'sleepydearest',
		'soggysuck',
		'attachedwatcher',
		'welloffbumper',
		'tornexcess',
		'grayengineering',
		'idolizedoverclocking',
		'shadowylabourer',
	];
	private triggers : string[] = [
		'manual',
		'automated',
	];


	constructor() {}


	private getRandomFloat() : number {
		return typeof globalThis?.crypto?.getRandomValues === 'function'
			? this.getRandomCryptoFloat()
			: Math.random();
	}

	private getRandomCryptoFloat() : number {
		const arr = new Uint32Array(1);

		globalThis.crypto.getRandomValues(arr);

		return arr[0] / 0x100000000;
	}

	private getRandomElement(arr : any[]) : any {
		return arr[ Math.floor(this.getRandomFloat() * arr.length) ];
	}

	private getRandomIntegerFromInterval(min : number, max : number) : number { // min and max included
		return Math.floor(this.getRandomFloat() * (max - min + 1) + min);
	}

	name() : string {
		return this.getRandomElement(this.names);
	}

	isDirty() : boolean {
		return this.getRandomElement(this.trueFalse);
	}

	status() : RunStatus {
		return this.getRandomElement(this.statuses);
	}

	started() : number {
		// 1672560000000 = Jan 1 2023
		return this.getRandomIntegerFromInterval(1577836800000, Date.now());
	}

	machineTime() : number {
		// random duration between a tenth of a second and an hour
		return this.getRandomIntegerFromInterval(100, 3600000);
	}

	actor() : User {
		const name = this.getRandomElement(this.actorNames);

		return {
			name,
			id : 'github.com/' + name,
		};
	}

	trigger() : string {
		return this.getRandomElement(this.triggers);
	}

	erroredActionName(actions : Action[]) : string {
		return this.getRandomElement(actions)?.name ?? '';
	}
}
