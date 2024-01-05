<script lang="ts">
	import DomainDiscovery from '$lib/components/DomainDiscovery.svelte';
	import type { getRandomDomains } from '$lib/server/handlers';

	let { loggedIn, discoveryDomains } = $props<{
		loggedIn: boolean;
		discoveryDomains: Awaited<ReturnType<typeof getRandomDomains>>;
	}>();
</script>

<h1>Manic Pixie Dream URL</h1>
<h2>The social network for parked domains.</h2>

{#if !loggedIn}
	<p>
		Have you ever bought a domain before starting a side project? Or because you liked how it sounded? Or you thought
		maybe someone would eventually want to buy it from you? And you're still paying for it every year, right?
	</p>
	<p><strong>Welcome.</strong> You have friends here.</p>
	<p>
		On Manic Pixie Dream URL, you can tell the world what you want to build on your domain, start gathering email
		addresses if you (ever) launch, get and vote on ideas for the domain, and maybe even sell it to someone ready to
		build.
	</p>
	<p class="cta">
		<a href="/signup">Sign up</a> to get started. Your first domain is free.
	</p>
{/if}

{#if discoveryDomains.length}
	<DomainDiscovery {discoveryDomains} />
{/if}

<!-- TODO: show some hot ideas -->

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
