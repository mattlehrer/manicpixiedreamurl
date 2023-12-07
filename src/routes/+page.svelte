<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Welcome to {data.host}</h1>
<p>More coming soon</p>

<style>
	h1 {
		font-size: var(--font-size-fluid-3);
	}
</style>
