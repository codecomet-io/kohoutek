import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
var Tracer = /** @class */ (function () {
    function Tracer(dsn) {
        Sentry.init({
            dsn: dsn,
            // We recommend adjusting this value in production, or using tracesSampler for finer control
            tracesSampleRate: 1.0,
            integrations: [
                new RewriteFrames({
                    // XXX @spacedub - this is dependent on node version / modules
                    root: dirname(dirname(fileURLToPath(import.meta.url)))
                    // root: __dirname || process.cwd(),
                }),
            ],
        });
    }
    return Tracer;
}());
export { Tracer };
//# sourceMappingURL=sentry.js.map