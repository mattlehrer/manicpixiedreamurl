declare namespace svelteHTML {
	interface IntrinsicElements {
		script: {
			'event-site'?: string;
			'event-logged_in': boolean;
			src: string;
			async?: boolean;
			defer?: boolean;
			type?: string;
		};
	}
}
