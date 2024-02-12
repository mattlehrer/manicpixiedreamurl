import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { logger, transformEvent } from '$lib/server/logger';
import { lucia } from '$lib/server/lucia';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { dev } from '$app/environment';

Sentry.init({
	environment: dev ? 'development' : 'production',
	release: 'sveltekit-sentry@' + import.meta.env.PACKAGE_VERSION,
	dsn: 'https://35b54933d302a34621ae4ce110e1fb37@o4506605288685568.ingest.sentry.io/4506605292421120',
	tracesSampleRate: 1,
	denyUrls: [/api\/caddy/, /screenshots/],
});

await import('../migrate');

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const startTimer = Date.now();
	event.locals.startTimer = startTimer;
	event.locals.requestId = crypto.randomUUID();

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	const response = await resolve(event);
	logger.info({ status: response.status, ...transformEvent(event) });
	return response;
});

export const handleError: HandleServerError = Sentry.handleErrorWithSentry(({ event, status, error, message }) => {
	const errorId = crypto.randomUUID();

	event.locals.errorId = errorId;

	event.locals.error = error ? JSON.stringify(error) : undefined;
	event.locals.errorStackTrace = error instanceof Error ? error?.stack : undefined;

	logger.error({ message, status, ...transformEvent(event) });

	return {
		message: 'An unexpected error occurred.',
		errorId,
	};
});
