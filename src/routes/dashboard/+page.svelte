<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { X } from 'lucide-svelte';
	import DNSVerification from '$lib/components/DNSVerification.svelte';
	import { enhance } from '$app/forms';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import LoadingSpinner from '$lib/assets/LoadingSpinner.svelte';
	import { fade, fly } from 'svelte/transition';
	import { dev } from '$app/environment';
	import { aRecord } from '$lib/config';

	let { data, form } = $props();
	let innerHeight = $state(500);
	let innerWidth = $state(500);

	let reason: string = $state(form ? String(form?.reason) : '');
	let domain: string = $state(form ? String(form?.domain) : '');

	let mightBeAbleToAddDomain = $state(true);

	let updating: Record<string, 'updating' | 'updated' | 'error'> = $state({});

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

	$effect(() => {
		if (data.domains.length >= data.maxDomains) {
			mightBeAbleToAddDomain = false;
		}
		if (data.domains.some((d) => !d.bareDNSisVerified || !d.wwwDNSisVerified)) {
			mightBeAbleToAddDomain = false;
		}
	});

	$effect(() => {
		if (form?.inserted) {
			reason = '';
			domain = '';
		}
	});

	const {
		elements: { trigger, overlay, content, title, description, close, portalled },
		states: { open },
	} = createDialog({
		role: 'alertdialog',
		forceVisible: true,
	});
</script>

<svelte:head>
	<title>Dashboard | Manic Pixie Dream URL</title>
</svelte:head>

<svelte:window bind:innerWidth bind:innerHeight />

<h1>Welcome {data.username}</h1>

{#if !data.hasVerifiedEmail}
	<div>
		{#if form?.verificationError}<p class="notice error">Something went wrong. Please try again.</p>{/if}
		{#if form?.sent}
			<p class="notice success">Check your email!</p>
		{:else}
			<p class="notice">
				You haven't verified your email address yet. You'll need to do that before you can submit ideas and vote on
				them. Please check your email for a verification link.
			</p>
			<form action="?/resendVerification" method="post" use:enhance>
				<input type="submit" value="Resend verification email" />
			</form>
		{/if}
	</div>
{/if}

{#if data.domains.length}
	<p>You are currently using {data.domains.length} out of {data.maxDomains} domains on your current plan.</p>
	{#if data.domains.length < data.maxDomains && data.domains.some((d) => !d.bareDNSisVerified || !d.wwwDNSisVerified) && !form?.inserted}
		<p class="notice info">You'll need to verify the domains you've added so far before you can add more.</p>
	{/if}
{/if}
{#if form?.inserted}
	<p class="notice success">
		You're on your way! Instructions for setting up the DNS records for your domain are below. You'll need to do that
		before you can add more domains.
	</p>
	<div class="confetti">
		<div
			use:confetti={{
				colors: [
					'var(--pink-5)',
					'var(--pink-6)',
					'var(--pink-7)',
					'var(--pink-8)',
					'var(--green-3)',
					'var(--indigo-8)',
					'var(--yellow-3)',
				],
				stageHeight: innerHeight,
				stageWidth: innerWidth,
			}}
		/>
	</div>
{/if}

<form action="?/addDomain" method="post" use:enhance>
	{#if form?.invalid}<p class="error">Please enter a valid domain name.</p>{/if}
	{#if form?.invalidReason}<p class="error">Please enter a reason you bought the domain.</p>{/if}
	{#if form?.tooMany}<p class="error">
			You are currently only allowed {form.tooMany} domains. Paid plans for more domains coming soon.
		</p>{/if}
	{#if form?.subdomain}<p class="error">Subdomains are not permitted.</p>{/if}
	{#if form?.dnsNotVerified}<p class="error">Verify the domains you've already added before adding more.</p>{/if}
	<label for="domain">Add a domain</label>
	<input type="text" id="domain" name="domain" placeholder="example.com" bind:value={domain} />
	<label for="reason">Add a reason you bought it</label>
	<input type="text" id="reason" name="reason" placeholder="" bind:value={reason} />

	<input type="submit" value="Add domain" disabled={!mightBeAbleToAddDomain} />
	{#if data.domains.length === 0}
		<p>
			After this, the next step will be to add a couple DNS records. If you want, you can <a href="/domain-instructions"
				>read more about that</a
			> first.
		</p>
	{/if}
</form>

{#if domain.length && reason.length}
	<div transition:fade>
		<p>On the site, it will look like this:</p>
		<div class="dash-reason">
			<DomainReason {reason} />
		</div>
	</div>
{/if}

<hr />

<h2>Domains</h2>
{#if data.domains.length === 0}
	<p>You don't have any domains yet. Add one above.</p>
{:else}
	{#if !data.domains.every((d) => d.bareDNSisVerified && d.wwwDNSisVerified)}
		<p class="instructions">
			{#if data.domains.some((d) => d.bareDNSisVerified && d.wwwDNSisVerified)}
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
		<p class="notice">
			Note: if you are using Cloudflare, please turn off the DNS proxy ("orange cloud"), until we verify the domain. You
			can turn it on after verification if you <a href="/domain-instructions#cloudflare">follow the steps</a> in the detailed
			instructions. (It's only two steps.)
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
				><path stroke="var(--red-5)" d="M18 6 7 17l-5-5" /><path stroke="var(--red-5)" d="m22 10-7.5 7.5L13 16" /></svg
			> means that both need to be configured.
		</p>
	{/if}
	<table id="domains-table">
		<thead>
			<tr>
				<th>Domain</th>
				<th class="dns-column">DNS</th>
				<th class="wider">Reason</th>
				<th>Remove</th>
			</tr>
		</thead>
		<tbody>
			{#each data.domains as domain}
				<tr>
					<td>
						<a target="_blank" href="//{domain.name}{dev ? ':5173' : ''}">{domain.name}</a>
					</td>
					<td class="dns-column">
						<DNSVerification bind:domain></DNSVerification>
					</td>

					<td class="wider">
						<textarea
							name="{domain.name}-reason"
							rows="3"
							bind:value={domain.reason}
							onchange={() => updateReason(domain.id, domain.reason)}
						/>
						{#if updating[domain.id] === 'updating'}
							<LoadingSpinner />
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
					<!-- TODO: make this a small button and add an "are you sure? this action cannot be undone." dialog to confirm-->
					<td>
						<button
							use:melt={$trigger}
							class="inline-flex items-center justify-center rounded-md bg-white px-4 py-2
    font-medium leading-none text-magnum-700 shadow-lg hover:opacity-75"
						>
							Delete Item
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<div class="" use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
		<div
			class="dialog"
			transition:fly={{
				duration: 150,
				y: 8,
				// start: 0.96,
			}}
			use:melt={$content}
		>
			<h2 use:melt={$title} class="m-0 text-lg font-medium text-black">Are you sure you want to delete this?</h2>
			<p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
				This action cannot be undone. This will permanently delete the item and remove it from our servers.
			</p>

			<div class="mt-6 flex justify-end gap-4">
				<button
					use:melt={$close}
					class="inline-flex h-8 items-center justify-center rounded-[4px]
                    bg-zinc-100 px-4 font-medium leading-none text-zinc-600"
				>
					Cancel
				</button>
				<form method="post" action="?/deleteDomain" use:enhance>
					<input type="hidden" name="domainId" value={domain.id} />
					<input type="submit" value="Remove" />
				</form>
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex h-6 w-6
                appearance-none items-center justify-center rounded-full text-magnum-800
                hover:bg-magnum-100 focus:shadow-magnum-400"
			>
				<X class="square-4" />
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.confetti {
		display: flex;
		justify-content: center;
	}

	.instructions {
		font-weight: var(--font-weight-3);
		font-size: var(--font-size-3);
	}

	.instructions ~ .notice {
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

	.dash-reason {
		background-color: var(--surface-2);
		padding: var(--size-4);
		border-radius: var(--radius-3);
		margin-block-start: var(--size-2);
		margin-inline-start: calc(-1 * var(--size-4));
		margin-inline-end: calc(-1 * var(--size-4));
	}

	td textarea ~ svg:not(.spin) {
		display: inline-block;
		animation:
			1s var(--animation-fade-in) forwards,
			6s var(--animation-fade-out) forwards;
	}

	.dialog {
		position: fixed;
		left: 50%;
		top: 50%;
		z-index: 50;
		max-height: 85vh;
		width: 90vw;
		max-width: 450px;
		transform: translate(-50%, -50%);
		border-radius: var(--radius-3);
		background-color: var(--surface-1);
		padding: var(--size-3);
		box-shadow: var(--shadow-2);
	}
</style>
