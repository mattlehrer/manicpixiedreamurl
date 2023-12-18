<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.success}
	<h1>Your email address has been verified. Welcome!</h1>
{:else if data.error}
	<h1>Something went wrong. Please try again.</h1>
{:else}
	<h1>Something went wrong.</h1>
{/if}
