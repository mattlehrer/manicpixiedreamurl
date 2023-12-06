<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Welcome to {data.origin}</h1>
<p>More coming soon</p>
<hr />
<p>User id: {data.userId}</p>
<p>Username: {data.username}</p>
<form method="post" action="?/logout" use:enhance>
	<input type="submit" value="Sign out" />
</form>

<style>
	h1 {
		color: var(--blue-4);
	}
</style>
