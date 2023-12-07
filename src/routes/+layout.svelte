<script lang="ts">
	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';
	import '../app.css';
	import type { LayoutData } from './$types';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	export let data: LayoutData;
</script>

<div>
	<Header username={data.username} />

	<main>
		<slot />
	</main>

	<Footer />
</div>

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
