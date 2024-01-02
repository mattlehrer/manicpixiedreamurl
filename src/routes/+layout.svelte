<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import type { LayoutData } from './$types';
	import { dashboardSites } from '$lib/config';
	import { dev } from '$app/environment';

	export let data: LayoutData;
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

	{#if data.origin && dashboardSites.includes(data.origin)}
		<title>Manic Pixie Dream URL is a social network for parked domains</title>
	{:else}
		<title>What did you hope to find at {data.host}? | A Manic Pixie Dream URL</title>
	{/if}
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
