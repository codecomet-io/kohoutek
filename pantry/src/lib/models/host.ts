import * as os from 'node:os';

import type { AnyMap, StringMap } from 'briznads-helpers';

import type { int } from 'codecomet-js/source/buildkit-port/dependencies/golang/mock.js';

import type { User } from './user.js';


type HostSystem = {
	arch              : string;
	cpus              : any[];
	endianness        : string;
	freemem           : int;
	home              : string;
	hostname          : string;
	loadavg           : number[];
	networkInterfaces : AnyMap;
	platform          : string;
	release           : string;
	tmpdir            : string;
	totalmem          : number;
	type              : string;
	uptime            : number;
	userInfo          : AnyMap;
	version           : string;
}

/*
 * A runner is a machine able to run CodeComet pipelines
 * Right now this is being initialized with details from the machine running this script
 */
export class Host {
	// A unique identifier
	id : string; //  = "uuid1233445"

	// free form labels
	metadata? : StringMap;


	constructor(id : string, meta : StringMap) {
		this.id       = id;
		this.metadata = meta;
	}


	// runtime information
	runtime? : { [ key : string ] : string | undefined } = process.versions;
	system?  : HostSystem = {
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
		id   : 'github.com/spacedub',
		name : 'Space Raccoon',
	};
}