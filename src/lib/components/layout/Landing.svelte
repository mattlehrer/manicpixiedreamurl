<script lang="ts">
	import DomainDiscovery from '$lib/components/DomainDiscovery.svelte';
	import type { getRandomDomains } from '$lib/server/handlers';

	export let loggedIn: boolean;
	export let discoveryDomains: Awaited<ReturnType<typeof getRandomDomains>>;
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
		<a href="/signup">Sign up</a> to start submitting and voting on ideas. Collect ideas on your first three domains for
		free.
	</p>
{/if}

{#if discoveryDomains.length}
	<DomainDiscovery {discoveryDomains} other={false} />
{/if}

<!-- TODO: show some hot ideas -->

<style>
	h1 {
		color: var(--pink-6);
	}

	h2 {
		color: var(--text-2);
	}

	.cta {
		font-size: var(--font-size-5);
	}
</style>
