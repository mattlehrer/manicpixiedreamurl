import { dev } from '$app/environment';
import { AXIOM_DATASET, AXIOM_TOKEN } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { pino } from 'pino';

export const logger = dev
	? pino({
			level: 'trace',
			timestamp: pino.stdTimeFunctions.isoTime,
			transport: { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } },
		})
	: pino(
			pino.transport({
				targets: [
					{
						target: 'pino/file',
						options: {
							destination: 1,
						},
					},
					{
						target: '@axiomhq/pino',
						options: {
							dataset: AXIOM_DATASET,
							token: AXIOM_TOKEN,
						},
					},
				],
			}),
		);

export const transformEvent = (event: Partial<RequestEvent & App.Locals & App.Error>) => {
	return {
		request: {
			method: event.request?.method,
			path: event.url?.pathname,
			searchParams: event.url?.searchParams.entries(),
			startTimer: event.locals?.startTimer,
			timeInMs: event.locals?.startTimer ? Date.now() - event?.locals?.startTimer : undefined,
			requestId: event.locals?.requestId,
			referrer: event.request?.headers.get('referer'),
		},
		userId: event.locals?.user?.id,
		sessionId: event.locals?.session?.id,
		error: event.locals?.error,
		errorId: event.locals?.errorId,
		errorStackTrace: event.locals?.errorStackTrace,
	};
};
