import * as SentrySDK from '@sentry/vue';

export const Sentry = {
    init: (app: any, router: any, urls: string[]) => {
        return SentrySDK.init({
            app,
            dsn: 'https://4a7e629280feb526f2dffc489f1d423d@o4504552781905920.ingest.sentry.io/4505946733674496',
            // dsn: 'https://17d77ca6263c6f4ad5ba4b3abe1b7d2a@o4504552781905920.ingest.sentry.io/4505946476511232', // Dashboard
            integrations: [
                new SentrySDK.BrowserTracing({
                    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
                    tracePropagationTargets: urls,
                    routingInstrumentation: SentrySDK.vueRouterInstrumentation(router),
                }),
                new SentrySDK.Replay(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
            // Session Replay
            replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
            replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
        });
    },
};

export default { Sentry };
