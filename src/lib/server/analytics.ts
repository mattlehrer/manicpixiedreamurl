import { Analytics } from '@june-so/analytics-node';
import { JUNE_WRITE_KEY } from '$env/static/private';
import { dev } from '$app/environment';

export const analytics = new Analytics(JUNE_WRITE_KEY, {
	disable: dev,
});
