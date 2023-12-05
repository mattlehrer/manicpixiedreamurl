import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	return {
		origin: url.origin,
	};
};
