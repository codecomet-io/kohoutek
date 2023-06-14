import type { Writable } from 'svelte/store';

import { writable } from 'svelte/store';


export const spatialMode : Writable<boolean> = writable(true);
export const darkMode    : Writable<boolean> = writable(false);
