import { chromium, devices } from 'playwright';
import type { RequestHandler } from './$types';
import { dashboardSites } from '$lib/config';

export const GET: RequestHandler = async ({ url }) => {
	const browser = await chromium.launch();
	const context = await browser.newContext(devices['Desktop Chrome HiDPI']);
	const page = await context.newPage();

	const imageUrl = new URL(`${dashboardSites[0]}/og`);
	const site = url.searchParams.get('site');
	if (site) imageUrl.searchParams.set('site', site);
	const reason = url.searchParams.get('reason');
	if (reason) imageUrl.searchParams.set('reason', reason);
	// maybe add top idea later
	// const topIdea = url.searchParams.get('topIdea');
	// if (topIdea) imageUrl.searchParams.set('topIdea', topIdea);

	await page.goto(imageUrl.href);
	await page.waitForFunction(() => document.fonts.check('12px InterVariable'));

	const image = await page.locator('article.og').screenshot();

	// Teardown
	await context.close();
	await browser.close();

	return new Response(image, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400, immutable',
		},
	});
};
