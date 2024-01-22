<script lang="ts">
	import { page } from '$app/stores';
</script>

<div>
	{#if $page.status === 404}
		<h1>Page Not Found.</h1>
		<h3><a href="/">Go Home</a></h3>
	{:else}
		<h1>Unexpected Error</h1>
		<h3>We're investigating the issue.</h3>
	{/if}

	{#if $page.error?.errorId}
		<p>Error ID: {$page.error.errorId}</p>
	{/if}
</div>

<style lang="postcss">
	a {
		font-weight: var(--font-weight-6);
	}

	a,
	a:visited {
		color: var(--pink-6);
		text-decoration: wavy underline;
		text-underline-offset: 0.3rem;
		text-decoration-skip-ink: none;
	}
</style>
