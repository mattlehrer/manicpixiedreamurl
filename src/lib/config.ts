import { dev } from '$app/environment';

export const dashboardSites = dev
	? ['http://localhost:5173', 'http://192.168.0.243:5173', 'http://172.16.41.193:5173']
	: ['https://manicpixiedreamurl.com', 'https://www.manicpixiedreamurl.com'];

export const aRecord = dev ? '127.0.0.1' : '95.217.212.108';

export const confirmationEmailAddress = 'support@manicpixiedreamurl.com';
