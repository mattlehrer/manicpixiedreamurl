<script lang="ts">
	import { enhance } from '$app/forms';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { fade } from 'svelte/transition';
	import { dev } from '$app/environment';
	import { aRecord } from '$lib/config';

	let { data, form } = $props();

	let reason: string = $state(form ? String(form?.reason) : '');
	let domain: string = $state(form ? String(form?.domain) : '');

	let updating: Record<string, 'updating' | 'updated' | 'error'> = {};
	let dnsData = $state<{ [id: string]: { bareDns: boolean; wwwDns: boolean } }>({});

	$effect(() => {
		data.dnsData.then((d) => {
			d.forEach(async (entry) => {
				const { id, bareDnsPromise, wwwDnsPromise } = entry;
				const bareDns = (await bareDnsPromise).address === aRecord;
				const wwwDns = (await wwwDnsPromise).address === aRecord;
				dnsData[id] = { bareDns, wwwDns };
			});
		});
	});

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
{#await data.domains}
	<p>Loading domains...</p>
{:then domains}
	{#if domains.length === 0}
		<p>You don't have any domains yet. Add one above.</p>
	{:else}
		<p>You are currently using {domains.length} out of {data.maxDomains} domains on your current plan.</p>
		{#if Object.entries(dnsData ?? {}).some(([, { bareDns, wwwDns }]) => !(bareDns && wwwDns))}
			<p class="instructions">
				{#if Object.entries(dnsData ?? {}).some(([, { bareDns, wwwDns }]) => bareDns || wwwDns) && !Object.entries(dnsData ?? {}).every(([, { bareDns, wwwDns }]) => bareDns && wwwDns)}
					You have some more DNS configuration to do. To connect your remaining domains,
				{:else}
					To connect your domains to Manic Pixie Dream URL,
				{/if}
				you'll need to make a couple quick changes to the DNS settings. Point <strong>A records</strong> for the
				<strong>bare domain</strong>
				and the
				<strong>www. subdomain</strong>
				to
				<span class="mono">{aRecord}</span>. More <a href="/domain-instructions">detailed instructions</a> are also available.
			</p>
			<p class="instructions">
				Below,
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path stroke="var(--green-5)" d="M18 6 7 17l-5-5" /><path
						stroke="var(--green-5)"
						d="m22 10-7.5 7.5L13 16"
					/></svg
				>
				means your DNS is configured correctly.
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path stroke="var(--green-5)" d="M18 6 7 17l-5-5" /><path
						stroke="var(--red-5)"
						d="m22 10-7.5 7.5L13 16"
					/></svg
				>
				means the bare domain is configured correctly but the www. subdomain is not.
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path stroke="var(--red-5)" d="M18 6 7 17l-5-5" /><path
						stroke="var(--red-5)"
						d="m22 10-7.5 7.5L13 16"
					/></svg
				> means that both need to be configured.
			</p>
		{/if}
		<table id="domains-table">
			<thead>
				<tr>
					<th>Domain</th>
					<th class="dns-column">DNS</th>
					<th class="wider">Reason</th>
					<!-- <th>Remove</th> -->
				</tr>
			</thead>
			<tbody>
				{#each domains as domain}
					<tr>
						<td>
							<a href="//{domain.name}{dev ? ':5173' : ''}">{domain.name}</a>
						</td>
						<td class="dns-column">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path
									stroke={dnsData?.[domain.id]?.bareDns ? 'var(--green-5)' : 'var(--red-5)'}
									d="M18 6 7 17l-5-5"
								/><path
									stroke={dnsData?.[domain.id]?.wwwDns ? 'var(--green-5)' : 'var(--red-5)'}
									d="m22 10-7.5 7.5L13 16"
								/></svg
							>
							<p class="sr-only">
								DNS configuration {Object.entries(dnsData ?? {}).some(([, { bareDns, wwwDns }]) => !(bareDns && wwwDns))
									? 'is good.'
									: 'needs work.'}
							</p>
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
{/await}

<style lang="postcss">
	.instructions {
		font-weight: var(--font-weight-3);
		font-size: var(--font-size-3);
	}

	.instructions svg {
		display: inline;
		margin-bottom: -0.25rem;
	}

	label {
		display: block;
		margin-block-start: var(--size-2);
	}
	table {
		margin-block-start: var(--size-6);
		width: 100%;
	}

	td > textarea {
		padding: 0;
		margin: 0;
	}

	th:first-child,
	td:first-child {
		width: 8rem;
		text-align: left;
		padding-inline: var(--size-1);
	}

	.dns-column {
		width: 3rem;
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

	td textarea ~ svg {
		display: inline-block;
		animation:
			1s var(--animation-fade-in) forwards,
			6s var(--animation-fade-out) forwards;
	}
</style>
