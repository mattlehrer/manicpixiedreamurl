// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			code?: string;
			errorId?: string;
		}
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
			requestId: string;
			startTimer: number;
			error?: string;
			errorId: string;
			errorStackTrace?: string;
			message: unknown;
			track: unknown;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
