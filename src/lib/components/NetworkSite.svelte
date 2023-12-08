<script lang="ts">
	export let host: string;
</script>

<div class="wrapper">
	<!-- TODO: add header iframe with user state -->

	<h1>Welcome to {host}</h1>
	<p>More coming soon</p>
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
