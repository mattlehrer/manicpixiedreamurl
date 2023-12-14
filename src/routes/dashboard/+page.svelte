<script lang="ts">
	import { enhance } from '$app/forms';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { fade } from 'svelte/transition';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let reason: string = form ? String(form?.reason) : '';
	let domain: string = form ? String(form?.domain) : '';

	let updating: Record<string, 'updating' | 'updated' | 'error'> = {};

	async function updateReason(domainId: string, domainReason: string) {
		updating[domainId] = 'updating';
		const res = await fetch(`/api/domain`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ domainId, domainReason }),
		});
		if (res.ok) {
			updating[domainId] = 'updated';
		} else {
			updating[domainId] = 'error';
		}
	}
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
{#if data.domains.length === 0}
	<p>You don't have any domains yet. Add one above.</p>
{:else}
	<p>You are currently using {data.domains.length} out of {data.maxDomains} domains on your current plan.</p>
	<table id="domains-table">
		<thead>
			<tr>
				<th>Domain</th>
				<th class="wider">Reason</th>
				<!-- <th>Remove</th> -->
			</tr>
		</thead>
		<tbody>
			{#each data.domains as domain}
				<tr>
					<td>
						<a href="https://{domain.name}">{domain.name}</a>
					</td>

					<td class="wider">
						<textarea
							name="{domain.name}-reason"
							rows="3"
							bind:value={domain.reason}
							onchange={() => updateReason(domain.id, domain.reason)}
						/>
						{#if updating[domain.id] === 'updating'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="color: var(--text-2);"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg
							>
							<span class="sr-only">Updating...</span>
						{:else if updating[domain.id] === 'error'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="color: var(--red-8);"
								><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg
							>
							<span class="sr-only">Error</span>
						{:else if updating[domain.id] === 'updated'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="color: var(--green-7);"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg
							>
							<span class="sr-only">Updated</span>
						{/if}
					</td>
					<!-- <td>
					<form method="post" action="?/removeDomain" use:enhance>
						<input type="hidden" name="domain" value={domain.name} />
						<input type="submit" value="Remove" />
					</form>
				</td> -->
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style lang="postcss">
	label {
		display: block;
		margin-block-start: var(--size-2);
	}
	table {
		margin-block-start: var(--size-5);
		width: 100%;
	}

	td > form {
		padding: 0;
		margin: 0;
	}

	th:first-child,
	td:first-child {
		width: 8rem;
		text-align: left;
		padding-inline: var(--size-1);
	}

	.wider {
		min-width: 100%;
		text-align: left;
		padding-inline: var(--size-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.wider textarea {
		margin-inline-start: calc(-1 * var(--size-2));
		width: 85%;
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
