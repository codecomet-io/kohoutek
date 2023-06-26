import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess : preprocess(),
	kit        : {
		adapter : adapter(),
		alias   : {
			'$pantry'       : '../pantry',
			'$pantry/types' : '../pantry/src/lib/model',

			// alias "firebase/analytics" to "firebase/ga" as workaround to strange bug
			'firebase/ga'   : './node_modules/firebase/analytics',

			// file path shortcuts
			'$actions'      : './src/lib/actions',
			'$components'   : './src/lib/components',
			'$services'     : './src/lib/services',
			'$stores'       : './src/lib/stores',
			'$types'        : './src/lib/types',
			'$utilities'    : './src/lib/utilities',
		},
	},
};

export default config;
