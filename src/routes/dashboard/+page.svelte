<script lang="ts">
	import { enhance } from '$app/forms';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { fade } from 'svelte/transition';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let reason: string = form ? String(form?.reason) : '';
	let domain: string = form ? String(form?.domain) : '';
</script>

<h1>Welcome {data.username}</h1>

<form action="?/addDomain" method="post" use:enhance>
	{#if form?.invalid}<p class="error">Please enter a valid domain name.</p>{/if}
	{#if form?.invalidReason}<p class="error">Please enter a reason you bought the domain.</p>{/if}
	{#if form?.tooMany}<p class="error">
			You are currently only allowed {form.tooMany} domains. Paid plans for more domains coming soon.
		</p>{/if}
	{#if form?.subdomain}<p class="error">Subdomains are not permitted.</p>{/if}
	<label for="domain">Add a domain</label>
	<input type="text" name="domain" placeholder="example.com" bind:value={domain} />
	<label for="reason">Add a reason you bought it</label>
	<input type="text" name="reason" placeholder="" bind:value={reason} />

	<input type="submit" value="Add domain" />
</form>

{#if domain.length && reason.length}
	<div transition:fade>
		<p>On the site, it will look like this:</p>
		<div class="reason">
			<DomainReason {reason} username={data.username} />
		</div>
	</div>
{/if}

<hr />

<h2>Domains</h2>
<p>You are currently using {data.domains.length} out of {data.maxDomains} domains on your current plan.</p>
<ul>
	{#each data.domains as domain}
		<li>
			<a href="https://{domain.name}">{domain.name}</a> because {domain.reason}
			<!-- <form method="post" action="?/removeDomain" use:enhance>
				<input type="hidden" name="domain" value={domain} />
				<input type="submit" value="Remove" />
			</form> -->
		</li>
	{/each}
</ul>

<style>
	label {
		display: block;
		margin-block-start: var(--size-2);
	}
	ul {
		margin-block-start: var(--size-5);
	}

	li {
		margin-block-start: var(--size-2);
		font-size: var(--font-size-fluid-1);
	}

	.reason {
		background-color: var(--surface-2);
		padding: var(--size-4);
		width: max-content;
		border-radius: var(--radius-3);
		margin-block-start: var(--size-2);
		margin-inline-start: calc(-1 * var(--size-4));
	}
</style>
