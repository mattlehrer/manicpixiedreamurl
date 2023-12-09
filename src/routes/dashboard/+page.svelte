<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1>Welcome {data.username}</h1>

<form action="?/addDomain" method="post" use:enhance>
	{#if form?.invalid}<p class="error">Please enter a valid domain name.</p>{/if}
	{#if form?.tooMany}<p class="error">
			You are currently only allowed {form.tooMany} domains. Paid plans for more domains coming soon.
		</p>{/if}
	{#if form?.subdomain}<p class="error">Subdomains are not permitted.</p>{/if}
	<label for="domain">Add a domain</label>
	<input type="text" name="domain" placeholder="Domain" value={form?.domain ?? ''} />
	<label for="reason">Add a reason you bought this domain</label>
	<input type="text" name="reason" placeholder="" value={form?.invalidReason ?? ''} />

	<input type="submit" value="Add domain" />
</form>

<hr />

<h2>Domains</h2>
<p>You are currently using {data.domains.length} out of {data.maxDomains} domains on your current plan.</p>
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

<style>
	ul {
		margin-block-start: var(--size-5);
	}

	li {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-fluid-1);
	}
</style>
