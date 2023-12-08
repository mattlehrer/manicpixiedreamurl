import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.auth?.validate();

	return {
		host: url.host,
		username: session?.user.username,
	};
};
