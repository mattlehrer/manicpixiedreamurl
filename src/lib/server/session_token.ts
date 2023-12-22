import ExpiryMap from 'expiry-map';

export const sessionTokens = new ExpiryMap<string, string>(10_000); // 10 seconds
