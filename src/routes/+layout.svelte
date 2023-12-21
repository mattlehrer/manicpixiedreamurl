<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import type { LayoutData } from './$types';
	import { dashboardSites } from '$lib/config';
	import NetworkSite from '$lib/components/NetworkSite.svelte';

	export let data: LayoutData;
</script>

{#if data.origin && dashboardSites.includes(data.origin)}
	<div>
		<Header username={data.username} />

		<main>
			<slot />
		</main>

		<Footer />
	</div>
{:else if data.domain !== undefined}
	<NetworkSite host={data.host} domain={data.domain} ideas={data.ideas} />
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
