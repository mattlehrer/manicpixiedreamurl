import { promises } from 'node:dns';
import { logger } from './logger';

export const getDNSData = async (domain: string) => {
	try {
		const withResolve4 = await promises.resolve4(domain);
		return {
			address: withResolve4[0],
		};
	} catch (error) {
		logger.info(`node:dns resolve4 error for ${domain}`, JSON.stringify(error));
	}
	try {
		const withLookup = await promises.lookup(domain);
		logger.info({ r: withLookup });
		if (withLookup.address) return { address: withLookup.address };
	} catch (error) {
		logger.info(`node:dns lookup error for ${domain}`, JSON.stringify(error));
	}
	return {
		address: null,
	};
};
