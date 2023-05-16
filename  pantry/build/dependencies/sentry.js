import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
export class Tracer {
    constructor(dsn) {
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
}
//# sourceMappingURL=sentry.js.map