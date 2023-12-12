<script lang="ts">
	import DomainReason from './DomainReason.svelte';

	export let host: string;
	export let domain: { name: string; reason: string; owner: { username: string } };
</script>

<div class="wrapper">
	<h1>Welcome to {host}</h1>
	<DomainReason reason={domain.reason} username={domain.owner.username} />

	<!-- submit idea -->
</div>

<style>
	h1 {
		font-size: var(--font-size-fluid-3);
	}

	.wrapper {
		margin-block-start: var(--size-fluid-6);
		padding-inline: var(--size-fluid-4);
		padding-block: var(--size-fluid-2);
	}
</style>
