import ExpiryMap from 'expiry-map';

export const sessionTokens = new ExpiryMap<string, string>(1000);
