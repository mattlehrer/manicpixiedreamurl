<script lang="ts">
	import type { ActionData } from './$types';
	import Wantrepreneur from './Wantrepreneur.svelte';
	import Collector from './Collector.svelte';
	import Hoarder from './Hoarder.svelte';

	export let form: ActionData;
</script>

<h1>Pricing</h1>

<p>
	Don't let your investment in domains languish. Let them have some fun. This community can give you the push you need
	to get started on your idea or give you a suggestion you won't be able to stop thinking about.
</p>
<p class="notice info">* Paid plans are coming soon.</p>

<div class="pricing-cards">
	<Wantrepreneur />
	<Collector />
	<Hoarder />
</div>

<style>
	p {
		font-size: var(--font-size-fluid-1);
	}

	p.notice {
		background-color: var(--surface-2);
		color: var(--text-2);
		border-color: var(--pink-6);
	}
</style>
