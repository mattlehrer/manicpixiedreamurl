<script lang="ts">
	import { queryParam } from 'sveltekit-search-params';
	import Logo from '$lib/assets/mpdu_logo.svelte';

	const site = queryParam('site');
	const reason = queryParam('reason');
</script>

<article class="og">
	{#if $site && $reason}
		<div class="network-og">
			<div class="row">
				<div class="site">
					<h2>{$site}</h2>
					<p>because {$reason}</p>
				</div>
				<p>What would you build?</p>
			</div>
			<div id="branding" class="flex">
				<Logo />
				<div>
					<h1>Manic Pixie Dream URL</h1>
					<h3>The social network for parked domains.</h3>
				</div>
			</div>
		</div>
	{:else}
		<div class="mpdu-og">
			<Logo />
			<div class="col">
				<h1>Manic Pixie Dream URL</h1>
				<h2>The social network for parked domains.</h2>

				<p>What is your dream?</p>
				<p>What would you build?</p>
			</div>
		</div>
	{/if}
</article>

<style lang="postcss">
	@font-face {
		font-family: InterVariable;
		font-style: normal;
		font-weight: 100 900;
		font-display: swap;
		src: url('/fonts/InterVariable.woff2?v=4.0') format('woff2');
	}

	article {
		font-family: InterVariable;
		font-feature-settings:
			'liga' 1,
			'calt' 1; /* fix for Chrome */
		width: 1200px;
		height: 630px;
		background: var(--gradient-8);
		color: var(--gray-1);
		overflow:;
	}

	p {
		color: var(--gray-1);
	}

	.mpdu-og {
		display: flex;
		align-items: start;
		justify-content: center;
		gap: 2rem;
		padding-block: 8rem;
	}

	h1 {
		color: var(--pink-6);
	}

	.mpdu-og h1 {
		font-size: 4.5rem;
	}

	h2 {
		font-size: 2.7rem;
		font-weight: 700;
		text-wrap: unset;
		max-inline-size: none;
	}

	.mpdu-og h2 {
		margin-block-end: 4rem;
	}

	.mpdu-og p {
		font-size: 3.75rem;
		margin-block: 0rem;
		line-height: 1.25;
	}

	.network-og {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;

		padding-inline: 5rem;
		padding-block: 7rem;
	}

	.network-og h1 {
		font-size: 3.75rem;
	}

	.network-og h2 {
		color: var(--pink-6);
		font-size: 5rem;
		line-height: 1;
	}

	.network-og h3 {
		font-size: 2.2rem;
	}

	.network-og .site > * {
		margin: 0;
	}

	.network-og .row {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		position: relative;
	}

	.network-og .row > p {
		font-size: 2.75rem;
		font-weight: 800;
		transform: rotate(12deg);
		max-inline-size: 10ch;
		text-wrap: pretty;
		line-height: 1.1;
		text-align: center;
		margin-block-start: -0.5rem;
		background: var(--gradient-4);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		position: absolute;
		right: 0;
	}

	.network-og .site > p {
		font-size: 2.5rem;
		line-height: 1.2;
		margin-block-start: 0.5rem;
	}

	#branding > div {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		height: 100%;
	}

	.flex {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
	}
</style>
