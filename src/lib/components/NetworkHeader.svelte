<script lang="ts">
	import MpduLogo from '$lib/assets/mpdu_logo.svelte';
	import { dashboardSites } from '$lib/config';
</script>

<header class="network">
	<nav>
		<a href={dashboardSites[0]}><MpduLogo /></a>
	</nav>
</header>

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
</style>
