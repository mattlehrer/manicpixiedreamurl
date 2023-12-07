<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Welcome {data.username}</h1>
<p>More coming soon</p>
<hr />
<p>User id: {data.userId}</p>
<form method="post" action="?/logout" use:enhance>
	<input type="submit" value="Sign out" />
</form>

<style>
	li {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-fluid-1);
	}
</style>
