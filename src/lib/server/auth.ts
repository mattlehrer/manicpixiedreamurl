import { Discord, GitHub } from 'arctic';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';
import { dashboardSites } from '$lib/config';

export type ProviderId = 'github' | 'discord';

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);

export const discord = new Discord(
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	`${dashboardSites[0]}/login/discord/callback`,
);
