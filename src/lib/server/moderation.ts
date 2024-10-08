import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { logger } from './logger';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export const isProhibitedTextWithReasons = async (input: string) => {
	const response = await openai.moderations.create({ input });
	if (!response.results || typeof response.results !== 'object' || !Array.isArray(response.results)) {
		logger.error(JSON.stringify(response));
		throw new Error('Invalid response from OpenAI');
	}
	return { ...response.results[0] };
};
