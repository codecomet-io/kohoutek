export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.d5987826.js","imports":["_app/immutable/entry/start.d5987826.js","_app/immutable/chunks/index.dd150d2a.js","_app/immutable/chunks/singletons.dbd3bcc1.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.032d0f91.js","imports":["_app/immutable/entry/app.032d0f91.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/index.dd150d2a.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0], errors: [1], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
