<script lang="ts">
	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import type { LayoutData } from './$types';
	import { dashboardSite } from '$lib/config';
	import NetworkSite from '$lib/components/NetworkSite.svelte';

	export let data: LayoutData;
</script>

{#if data.origin === dashboardSite}
	<div>
		<Header username={data.username} />

		<main>
			<slot />
		</main>

		<Footer />
	</div>
{:else if data.domain !== undefined}
	<NetworkSite host={data.host} domain={data.domain} />
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
