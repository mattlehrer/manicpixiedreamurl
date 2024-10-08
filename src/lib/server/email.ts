import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_AUDIENCE_ID } from '$env/static/private';
import {
	deleteAllEmailVerificationCodesForUser,
	getAllEmailVerificationCodesForUser,
	insertEmailVerificationCode,
	insertPasswordResetToken,
	updateUser,
	type User,
} from './handlers';
import { supportEmailAddress, dashboardSites } from '$lib/config';
import { dev } from '$app/environment';
import { logger } from './logger';

const resend = new Resend(RESEND_API_KEY);

export const sendVerificationEmail = async (user: Pick<User, 'email' | 'id'>) => {
	const existingCodes = await getAllEmailVerificationCodesForUser(user.id);
	if (existingCodes.length) {
		if (existingCodes[0].createdAt && new Date(existingCodes[0].createdAt).getTime() > Date.now() - 1000 * 60 * 5) {
			// within the last five minutes
			return { ok: true };
		}
		await deleteAllEmailVerificationCodesForUser(user.id);
	}

	const codeArray = await insertEmailVerificationCode(user.id);
	if (!codeArray.length) throw new Error('Failed to insert code');

	const code = codeArray[0].code;
	const link = `${dashboardSites[0]}/confirm/?code=${code}`;

	const html = `<p>Please confirm your email address by <a href="${link}">clicking this link</a> or pasting this into your browser:</p><p>${link}</p>`;

	if (dev) {
		console.log({ html });
	} else {
		const resp = await resend.emails.send({
			from: supportEmailAddress,
			to: user.email,
			subject: 'Confirm your Manic Pixie Dream URL account',
			html,
		});

		if (resp.error) throw new Error('Failed to send email');
	}
	return { ok: true };
};

export const sendPasswordResetEmail = async (user: Pick<User, 'email' | 'id'>) => {
	const token = await insertPasswordResetToken(user.id);
	if (!token.length || !token[0].token) throw new Error('Failed to insert token');
	const link = new URL(`/reset-password/${token[0].token}`, dashboardSites[0]);

	const html = `<p>You can reset your password by <a href="${link}">clicking this link</a> or pasting this into your browser:</p><p>${link}</p>`;

	if (dev) {
		console.log({ html });
	} else {
		const resp = await resend.emails.send({
			from: supportEmailAddress,
			to: user.email,
			subject: 'Reset your Manic Pixie Dream URL password',
			html,
		});

		if (resp.error) throw new Error('Failed to send email');
	}
	return { ok: true };
};

export const addUserToMailingList = async (user: Pick<User, 'email' | 'id'>) => {
	const resp: {
		data: { object: string; id: string } | null;
		error: Error | null;
	} = await resend.contacts.create({
		audienceId: RESEND_AUDIENCE_ID,
		email: user.email,
		unsubscribed: false,
	});

	logger.info({ msg: 'Adding user to mailing list', resp });

	if (!resp.data?.id) throw new Error('Failed to add user to mailing list');

	const update = await updateUser(user.id, { resendContactId: resp.data.id });
	logger.info({ msg: 'Added user to resend audience', update });

	return { ok: true };
};
