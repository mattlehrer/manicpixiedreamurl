<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1>Welcome {data.username}</h1>

<form action="?/addDomain" method="post">
	{#if form?.invalid}<p class="error">Please enter a valid domain name.</p>{/if}
	{#if form?.subdomain}<p class="error">Subdomains are not permitted.</p>{/if}
	<label for="domain">Add a domain</label>
	<input type="text" name="domain" placeholder="Domain" value={form?.domain ?? ''} />
	<input type="submit" value="Add domain" />
</form>

<hr />

<h2>Domains</h2>
<ul>
	{#each data.domains as domain}
		<li>
			<a href="https://{domain.name}">{domain.name}</a>
			<!-- <form method="post" action="?/removeDomain" use:enhance>
				<input type="hidden" name="domain" value={domain} />
				<input type="submit" value="Remove" />
			</form> -->
		</li>
	{/each}
</ul>

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

	p.error {
		color: var(--red-7);
	}
</style>
