export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["CodeComet-logo.svg","favicon-color.png","favicon.png"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.a012b071.js","imports":["_app/immutable/entry/start.a012b071.js","_app/immutable/chunks/index.c25e2327.js","_app/immutable/chunks/singletons.bde1ea63.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.9b959bfc.js","imports":["_app/immutable/entry/app.9b959bfc.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/index.c25e2327.js"],"stylesheets":[],"fonts":[]}},
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
