<script lang="ts">
	import type { getRandomDomains } from '$lib/server/handlers';
	import NetworkDomainCard from './NetworkDomainCard.svelte';

	let { discoveryDomains } = $props<{
		discoveryDomains: Awaited<ReturnType<typeof getRandomDomains>>;
	}>();

	// $inspect(discoveryDomains);
</script>

<section class="domain-discovery">
	<h3>Check out some domains in the network</h3>
	<ul>
		{#each discoveryDomains as domain}
			<li>
				<NetworkDomainCard {domain} />
			</li>
		{/each}
	</ul>
</section>

<style>
	h1 {
		color: var(--pink-6);
	}

	h2 {
		color: var(--text-2);
	}

	section.domain-discovery {
		margin-block-start: var(--size-fluid-5);
		padding-block: var(--size-fluid-4);
	}

	h3 {
		margin-block-end: var(--size-fluid-2);
	}

	.cta {
		font-size: var(--font-size-5);
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
