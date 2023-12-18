import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { insertEmailVerificationCode, type User } from './handlers';
import { confirmationEmailAddress, dashboardSites } from '$lib/config';
const resend = new Resend(RESEND_API_KEY);

export const sendVerificationEmail = async (user: Pick<User, 'email' | 'id'>) => {
	const codeArray = await insertEmailVerificationCode(user.id);
	if (!codeArray.length) throw new Error('Failed to insert code');

	const code = codeArray[0].code;
	const link = `${dashboardSites[0]}/confirm/?code=${code}`;

	const resp = await resend.emails.send({
		from: confirmationEmailAddress,
		to: user.email,
		subject: 'Confirm your Manic Pixie Dream URL account',
		html: `<p>Please confirm your email address by <a href="${link}">clicking this link</a> or pasting this into your browser:</p><p>${link}</p>`,
	});

	if (resp.error) throw new Error('Failed to send email');
	return { ok: true };
};
