import { dev } from '$app/environment';
import { handleErrorWithSentry, Replay } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	environment: dev ? 'development' : 'production',
	release: 'sveltekit-sentry@' + import.meta.env.PACKAGE_VERSION,

	dsn: 'https://35b54933d302a34621ae4ce110e1fb37@o4506605288685568.ingest.sentry.io/4506605292421120',
	tracesSampleRate: dev ? 1.0 : 0.25,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: dev ? 1 : 0.1,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,

	// If you don't want to use Session Replay, just remove the line below:
	integrations: [new Replay()],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
