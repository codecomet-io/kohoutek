import adapter from '@sveltejs/adapter-static'
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		})
	}
};

export default config;




// import multiAdapter from '@macfja/svelte-multi-adapter'
// import staticAdapter from '@sveltejs/adapter-static';
// import vercelAdapter from '@sveltejs/adapter-vercel';
// import preprocess from 'svelte-preprocess';


// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	preprocess: preprocess(),

// 	kit : {
// 		adapter : multiAdapter([
// 			staticAdapter({
// 				pages : 'dist',
// 				assets : 'dist',
// 				fallback : 'index.html',
// 			}),
// 			vercelAdapter({}),
// 		]),
// 	}
// };

// export default config;
