import type { Writable } from 'svelte/store';

import { writable } from 'svelte/store';


export const highlight : Writable<string> = writable('');
export const active : Writable<string> = writable('');
