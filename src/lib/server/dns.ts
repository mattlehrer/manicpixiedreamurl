import { promises } from 'node:dns';

export const getDNSData = async (domain: string) => promises.lookup(domain);

export type LookupAddress = Awaited<ReturnType<typeof promises.lookup>>;
