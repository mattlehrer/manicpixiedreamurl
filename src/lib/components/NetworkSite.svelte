<script lang="ts">
	import MpduLogo from '$lib/assets/mpdu_logo.svelte';
	import { dashboardSites } from '$lib/config';
	import DomainReason from './DomainReason.svelte';

	export let host: string;
	export let domain: { name: string; reason: string; owner: { username: string } };
</script>

<header class="network">
	<nav>
		<a href={dashboardSites[0]}><MpduLogo /></a>
	</nav>
</header>

<div class="wrapper">
	<h1>Welcome to {host}</h1>
	<DomainReason reason={domain.reason} />

	<!-- submit idea -->
</div>

<style>
	nav {
		display: flex;
		justify-content: end;
		align-items: center;
		padding-inline: var(--size-fluid-2);
		padding-block: var(--size-fluid-2);
	}

	nav a,
	nav a:visited {
		color: var(--text-1);
	}

	h1 {
		font-size: var(--font-size-fluid-3);
	}

	.wrapper {
		margin-block-start: var(--size-fluid-6);
		padding-inline: var(--size-fluid-4);
		padding-block: var(--size-fluid-2);
	}
</style>
