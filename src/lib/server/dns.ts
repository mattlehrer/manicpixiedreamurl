import { promises } from 'node:dns';

export const getDNSData = async (domain: string) => {
	try {
		const withResolve4 = await promises.resolve4(domain);
		return {
			address: withResolve4[0],
		};
	} catch (error) {
		console.log('resolve4', error);
		const withLookup = await promises.lookup(domain);
		console.log({ r: withLookup });
		if (withLookup.address) return { address: withLookup.address };
		return {
			address: null,
		};
	}
};
