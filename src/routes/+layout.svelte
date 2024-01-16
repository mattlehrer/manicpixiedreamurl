<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import type { LayoutData } from './$types';
	import { dashboardSites } from '$lib/config';
	import { dev } from '$app/environment';

	export let data: LayoutData;

	const ogUrl = new URL(`${dashboardSites[0]}/og/image`);

	$: if (data.domain) {
		ogUrl.searchParams.set('site', data.domain.name);
		ogUrl.searchParams.set('reason', data.domain.reason);
	}
</script>

<svelte:head>
	{#if !dev}
		<script
			defer
			event-site={data.host}
			event-logged_in={data.loggedIn}
			data-domain="manicpixiedreamurl.com"
			src="/js/script.js"
		></script>
	{/if}

	{#if !data.domain}
		<title>Manic Pixie Dream URL is a social network for parked domains</title>
		<meta content={ogUrl.href} property="og:image" />
		<meta
			content="Manic Pixie Dream URL. The social network for parked domains. What is your dream? What would you build?"
			property="og:image:alt"
		/>
		<meta content="Manic Pixie Dream URL: The social network for parked domains" property="og:title" />

		<meta
			name="description"
			content="The home for the domains you keep renewing and haven't given up on yet. Collect emails for your idea and find out if anyone has a better one."
		/>
	{:else}
		<title>What did you hope to find at {data.host}? | A Manic Pixie Dream URL</title>
		<link rel="canonical" href={data.origin} />
		<meta content={ogUrl.href} property="og:image" />
		<meta
			content={`${data.host} - because ${data.domain.reason}. What would you build? Manic Pixie Dream URL, the social network for parked domains.`}
			property="og:image:alt"
		/>
		<meta content={`${data.domain.name} is a Manic Pixie Dream URL`} property="og:title" />

		<meta
			name="description"
			content={`Someone bought this domain and hasn't given up on it yet. What would you build?`}
		/>
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#if data.origin && dashboardSites.includes(data.origin)}
	<div>
		<Header username={data.username} />

		<main>
			<slot />
		</main>

		<Footer />
	</div>
{:else if data.domain !== undefined}
	<slot />
{:else}
	<!-- 404 from +layout.server -->
{/if}

<style>
	div {
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: 100dvh;
	}
	main {
		padding: var(--size-fluid-4);
	}
</style>
