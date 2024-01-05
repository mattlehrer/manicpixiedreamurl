<script lang="ts">
	import { dev } from '$app/environment';
	import type { getRandomDomains } from '$lib/server/handlers';

	let { domain } = $props<{ domain: Awaited<ReturnType<typeof getRandomDomains>>[number] }>();
</script>

<article>
	<a href={`//${domain.name}${dev ? ':5173' : ''}`}>
		<h3>{domain.name}</h3>
		<p><span>Someone bought it because</span> {domain.reason}</p>
		{#if domain.ideas.length && domain.ideas[0]?.text}
			<p><span>The best idea so far is</span> {domain.ideas[0].text}</p>
		{/if}
	</a>
</article>

<style lang="postcss">
	article {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: var(--size-3);
		border-radius: var(--radius-3);
		background-color: var(--surface-2);
		box-shadow: var(--shadow-3);
	}

	h3 {
		font-size: var(--font-size-4);
	}

	p {
		font-size: var(--font-size-3);
	}

	span {
		font-weight: var(--font-weight-2);
	}

	a {
		color: var(--pink-6);
	}

	a:hover {
		text-decoration: none;
	}

	article:hover {
		transform: scale(1.1);
		transition: transform 0.2s var(--ease-1);
		background-color: var(--surface-4);
	}

	a:active {
		color: var(--pink-8);
	}
</style>
