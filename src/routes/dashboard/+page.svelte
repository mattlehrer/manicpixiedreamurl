<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import DNSVerification from '$lib/components/DNSVerification.svelte';
	import { enhance } from '$app/forms';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { dev } from '$app/environment';
	import { aRecord } from '$lib/config';

	let { data, form } = $props();
	let innerHeight = $state(500);
	let innerWidth = $state(500);

	let reason: string = $state(form ? String(form?.reason) : '');
	let domain: string = $state(form ? String(form?.domain) : '');

	let removeDomain: { id: string; name: string } | null = $state(null);
	let editDomain: { id: string; name: string; reason: string } | null = $state(null);

	$effect(() => {
		if (!$openEditDialog) {
			removeDomain = null;
		}
	});
	$effect(() => {
		if (!$openDeleteDomainDialog) {
			removeDomain = null;
		}
	});

	let mightBeAbleToAddDomain = $state(true);

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
		elements: {
			trigger: triggerEditDialog,
			overlay: overlayEditDialog,
			content: contentEditDialog,
			title: titleEditDialog,
			description: descriptionEditDialog,
			close: closeEditDialog,
			portalled: portalledEditDialog,
		},
		states: { open: openEditDialog },
	} = createDialog({
		role: 'alertdialog',
		forceVisible: true,
	});

	const {
		elements: {
			trigger: triggerDeleteDialog,
			overlay: overlayDeleteDialog,
			content: contentDeleteDialogDeleteDialog,
			title: titleDeleteDialog,
			description: descriptionDeleteDialog,
			close: closeDeleteDialog,
			portalled: portalledDeleteDialog,
		},
		states: { open: openDeleteDomainDialog },
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
				<th>Edit</th>
			</tr>
		</thead>
		<tbody>
			{#each data.domains as domain (domain.id)}
				<tr out:slide>
					<td>
						<a target="_blank" href="//{domain.name}{dev ? ':5173' : ''}">{domain.name}</a>
					</td>
					<td class="dns-column">
						<DNSVerification bind:domain></DNSVerification>
					</td>

					<td class="wider">
						{domain.reason}
					</td>
					<td>
						<button
							use:melt={$triggerEditDialog}
							class="edit-btn"
							onclick={() => {
								editDomain = domain;
							}}
						>
							<svg
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								viewBox="0 0 24 24"
								><path d="M20 7h-9m3 10H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg
							>
							<span class="sr-only">Edit {domain.name}</span>
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<div class="" use:melt={$portalledEditDialog}>
	{#if $openEditDialog}
		<div use:melt={$overlayEditDialog} class="dialog-bg" />
		<div
			class="dialog"
			transition:fly={{
				duration: 150,
				y: 8,
			}}
			use:melt={$contentEditDialog}
		>
			{#if editDomain}
				<h2 use:melt={$titleEditDialog} class="dialog-title">
					Edit {editDomain.name}
				</h2>
				<p use:melt={$descriptionEditDialog} class="dialog-description">
					You can edit the reason you bought this domain or delete it here. Editing the reason will create a new idea
					that can be voted on for your domain.
				</p>
				<form
					method="post"
					action="?/updateReason"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							// TODO: show error, show success; add toasts
							// if (result.type === 'success') {
							$openEditDialog = false;
							// }
						};
					}}
				>
					<label for="edit-reason"> Reason </label>
					<textarea id="edit-reason" name="reason" rows="3" value={editDomain.reason} />
					<input type="hidden" name="domainId" value={editDomain.id} />

					<label for="remove-domain">Want to delete this domain?</label>
					<button
						use:melt={$triggerDeleteDialog}
						id="remove-domain"
						class="remove-btn"
						onclick={() => {
							removeDomain = editDomain;
						}}
					>
						Remove {editDomain.name}
					</button>

					<div class="dialog-actions">
						<button use:melt={$closeEditDialog} class="dialog-secondary"> Cancel </button>
						<input type="hidden" name="domainId" value={editDomain?.id} />
						<input type="submit" class="dialog-primary" value="Save" disabled={!editDomain} />
					</div>
				</form>
			{/if}

			<button use:melt={$closeEditDialog} aria-label="Close" class="dialog-close">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
			</button>
		</div>
	{/if}
</div>

<div class="" use:melt={$portalledDeleteDialog}>
	{#if $openDeleteDomainDialog}
		<div use:melt={$overlayDeleteDialog} class="dialog-bg" />
		<div
			class="dialog"
			transition:fly={{
				duration: 150,
				y: 8,
				// start: 0.96,
			}}
			use:melt={$contentDeleteDialogDeleteDialog}
		>
			<h2 use:melt={$titleDeleteDialog} class="dialog-title">
				Are you sure you want to remove {removeDomain?.name} from your account?
			</h2>
			<p use:melt={$descriptionDeleteDialog} class="dialog-description">
				<strong>This action cannot be undone.</strong> This will permanently delete the domain and all associated ideas and
				votes from our servers.
			</p>

			<div class="dialog-actions">
				<form
					method="post"
					action="?/deleteDomain"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							// TODO: show error, show success; add toasts
							// if (result.type === 'success') {
							$openDeleteDomainDialog = false;
							$openEditDialog = false;
							mightBeAbleToAddDomain = true;
							// }
						};
					}}
				>
					<button use:melt={$closeDeleteDialog} class="dialog-secondary"> Cancel </button>
					<input type="hidden" name="domainId" value={removeDomain?.id} />
					<input
						type="submit"
						class="delete-dialog-primary"
						value="Permanently delete {removeDomain?.name}"
						disabled={!removeDomain}
					/>
				</form>
			</div>

			<button use:melt={$closeDeleteDialog} aria-label="Close" class="dialog-close">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
				>
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

	label[for='remove-domain'] {
		margin-block-start: var(--size-4);
	}

	table {
		margin-block-start: var(--size-6);
		border-radius: 0;
		width: 100%;
		max-width: 100%;
		border-collapse: collapse;
		border: 0;
		--nice-inner-radius: 0;
	}

	tbody tr {
		border-bottom: 1px solid var(--surface-2);
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
		/* padding-inline: var(--size-1); */
		display: flex;
		align-items: center;
		position: relative;
	}

	.dash-reason {
		background-color: var(--surface-2);
		padding: var(--size-4);
		border-radius: var(--radius-3);
		margin-block-start: var(--size-2);
		margin-inline-start: calc(-1 * var(--size-4));
		margin-inline-end: calc(-1 * var(--size-4));
	}

	.edit-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-2);
		padding: var(--size-1) var(--size-2);
		background-color: var(--surface-1);
		font-weight: var(--font-weight-2);
		transition: var(--transition-shadow);
		width: var(--size-3);
		height: var(--size-3);
		padding: 0;
		background-color: inherit;
		border: none;
		box-shadow: none;
		outline-offset: 3px;
	}

	.edit-btn {
		color: var(--text-2);
		vertical-align: middle;
	}

	.remove-btn {
		width: max-content;
		font-size: var(--font-size-1);
		font-weight: var(--font-weight-3);
		color: var(--red-5);
		padding: var(--size-1) var(--size-3);
	}

	.edit-btn:hover {
		--_highlight-size: var(--size-1);
		opacity: 0.75;
		animation: var(--animation-scale-up) 0.2s forwards;
	}

	.dialog-bg {
		position: fixed;
		inset: 0;
		z-index: 50;
		background-color: hsl(var(--gray-9-hsl) / 80%);
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
		border-radius: var(--radius-2);
		background-color: var(--surface-2);
		padding: var(--size-3);
		box-shadow: var(--shadow-2);
	}

	.dialog-title {
		margin: 0;
		padding-inline-end: var(--size-5);
		font-size: var(--font-size-3);
		line-height: var(--font-lineheight-1);
		font-weight: var(--font-weight-6);
		color: rgb(var(--text-1) / 1);
	}

	.dialog-description {
		/* margin-bottom: 1.25rem;
		margin-top: 0.5rem; */
		margin-block-start: var(--size-3);
		margin-block-end: var(--size-4);
		line-height: var(--font-lineheight-2);
		font-size: var(--font-size-2);

		color: var(--text-2);
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--size-3);

		margin-top: var(--size-6);
	}

	.dialog-actions form {
		margin: 0;
		display: flex;
		flex-direction: row;
		gap: 1rem;
		align-items: center;
	}

	.dialog-actions form input[type='submit'] {
		margin: 0;
	}

	.dialog-actions button,
	.dialog-actions input[type='submit'] {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		height: 2rem;

		border-radius: var(--radius-2);

		padding: var(--size-1) var(--size-2);

		font-weight: var(--font-weight-4);
		line-height: 1;
		--_ink-shadow: 0;
	}

	.dialog-actions button.dialog-secondary {
		background-color: rgb(var(--gray-2) / 1);

		color: var(--blue-6);
	}

	.dialog-actions input[type='submit'] {
		margin-block-start: 0;
	}

	.dialog-actions input[type='submit'].delete-dialog-primary {
		text-wrap: wrap;
		height: auto;
		background-color: var(--red-0);
		color: var(--red-9);
	}

	.dialog-actions input[type='submit'].dialog-primary {
		background-color: var(--blue-0);
		color: var(--blue-8);
	}

	.dialog-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		position: absolute;
		right: 10px;
		top: 10px;

		appearance: none;

		height: var(--size-5);
		width: var(--size-5);

		border-radius: var(--radius-6);

		color: var(--text-2);
		padding: 0;
		background-color: inherit;
		border: none;
		box-shadow: none;
	}

	.dialog-close:hover {
		background-color: var(--surface-2);
	}

	.dialog-close:focus {
		box-shadow: 0px 0px 0px 3px rgb(var(--blue-4) / 1);
	}

	textarea#edit-reason {
		background-color: var(--surface-3);
		field-sizing: content;
	}
</style>
