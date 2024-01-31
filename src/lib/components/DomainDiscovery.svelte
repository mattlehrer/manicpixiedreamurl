<script lang="ts">
	import type { getRandomDomains } from '$lib/server/handlers';
	import NetworkDomainCard from './NetworkDomainCard.svelte';

	export let discoveryDomains: Awaited<ReturnType<typeof getRandomDomains>>;
	export let other: boolean;

	// $inspect(discoveryDomains);
</script>

<section class="domain-discovery">
	<h3>Check out some {other ? 'other ' : ''}domains in the network</h3>
	<ul>
		{#each discoveryDomains as domain}
			<li>
				<NetworkDomainCard {domain} />
			</li>
		{/each}
	</ul>
</section>

<style>
	section.domain-discovery {
		margin-block-start: var(--size-fluid-2);
		padding-block: var(--size-fluid-4);
	}

	h3 {
		color: var(--text-2);
		font-weight: var(--font-weight-7);
		line-height: var(--font-lineheight-0);
		margin-block-end: var(--size-fluid-2);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-fluid-3);
		list-style: none;
		padding: 0;
	}

	li {
		max-width: 320px;
		flex: 0 1 320px;
		padding: 0;
	}
</style>
