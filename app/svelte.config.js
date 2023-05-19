import netlifyAdapter from '@sveltejs/adapter-netlify';
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess : preprocess(),

	kit : {
		adapter : netlifyAdapter({}),
	},
};

export default config;
