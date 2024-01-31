<script lang="ts">
	import Landing from '$lib/components/layout/Landing.svelte';
	import { dashboardSites } from '$lib/config';
	import type { PageData, ActionData } from './$types';
	import NetworkHeader from '$lib/components/NetworkHeader.svelte';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { enhance } from '$app/forms';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { onMount } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import DomainDiscovery from '$lib/components/DomainDiscovery.svelte';
	import { flip } from 'svelte/animate';

	export let data: PageData;
	export let form: ActionData;

	const token = queryParam('token', ssp.string(), {
		pushHistory: false,
	});

	onMount(() => {
		if ($token?.length) {
			// remove token from url after use
			$token = null;
		}
	});

	$: if (form?.inserted) {
		$open = true;
	}

	const {
		elements: {
			// trigger,
			overlay,
			content,
			title,
			description,
			close,
			portalled,
		},
		states: { open },
	} = createDialog();
</script>

<svelte:head>
	{#if !data.domain}
		<link href={dashboardSites[0]} rel="canonical" />
	{/if}
</svelte:head>

{#if data.origin && dashboardSites.includes(data.origin)}
	<Landing loggedIn={data.loggedIn} discoveryDomains={data.discoveryDomains} />
{:else if data.domain !== undefined}
	<NetworkHeader />
	<div class="wrapper">
		<h1>Welcome to {data.host}</h1>
		<DomainReason reason={data.domain.reason} />
		<section>
			<h2>What do you wish you found at this domain?</h2>
			{#if data.loggedIn && !data.isEmailVerified}
				<form method="post" use:enhance>
					{#if form?.sent}
						<p class="notice success">Email sent! Click the link in that email to vote and submit ideas.</p>
					{:else}
						<p class="notice info" out:fade={{ duration: 2000 }}>
							You need to verify your email address before you can vote or submit your own ideas. Check your inbox for a
							verification email. If you can't find it, you can <button formaction="?/resendVerification"
								>send another</button
							>.
						</p>
					{/if}
				</form>
			{/if}
			<h3>Vote on the best ideas so far:</h3>
			<ul>
				{#each data.ideas as idea (idea.id)}
					{@const existingVote = data.userId && idea.votes.find((vote) => vote.userId === data.userId)}
					<li animate:flip={{ duration: 500 }}>
						<form class="vote" method="post" use:enhance>
							<input type="hidden" name="idea" value={idea.id} />
							<button
								class:voted={existingVote && existingVote?.type === 1}
								formaction={existingVote && existingVote?.type === 1 ? '?/unvote' : '?/upvote'}>^</button
							>
							<span style={`margin-left: ${idea.score < 0 ? '-1ch' : '0'}`}>{idea.score}</span>
							<button
								class="flip"
								class:voted={existingVote && existingVote?.type === -1}
								formaction={existingVote && existingVote?.type === -1 ? '?/unvote' : '?/downvote'}>^</button
							>
						</form>
						<span>
							{idea.text}
							{#if idea.isDomainOwners}
								<sup title="Submitted by the domain owner">OP</sup>
							{/if}
						</span>
					</li>
				{:else}
					<p>No one has submitted a good idea for this site yet. Be the first!</p>
				{/each}
			</ul>

			<form id="submit-suggestion" action="?/addSuggestion" method="post" use:enhance>
				<label for="idea"> What's your best idea for this domain? </label>
				{#if form?.invalid}<p class="error" transition:slide>That wasn't a good idea. You can do better.</p>{/if}
				{#if form?.notUnique}<p class="error" transition:slide>
						Someone has already suggested that idea. Upvote it instead!
					</p>{/if}
				{#if form?.flagged}<p class="error" transition:slide>We don't allow ideas like that.</p>{/if}
				<input type="text" name="idea" id="idea" value={data.newIdea} minlength="5" required />
				<input type="submit" />
			</form>
		</section>

		<DomainDiscovery discoveryDomains={data.discoveryDomains} other={true} />
	</div>

	<div use:melt={$portalled}>
		{#if $open}
			<div use:melt={$overlay} class="dialog-bg" />
			<div
				class="dialog"
				transition:fly={{
					duration: 200,
					y: 8,
				}}
				use:melt={$content}
			>
				{#if form?.inserted}
					<p class="notice success">Thanks for that idea! We've added it to the list.</p>
				{/if}
				<h2 use:melt={$title} class="dialog-title">
					Got an idea for <a href={`//${form?.nextDomain?.name}`}>{form?.nextDomain?.name}</a>?
				</h2>
				<p use:melt={$description} class="dialog-description">The best ideas right now are:</p>
				<ul>
					{#each form?.nextDomain?.ideas ?? [] as idea}
						<li>{idea.text}</li>
					{/each}
				</ul>

				<form method="POST" action="?/anotherSuggestion" use:enhance>
					<label for="idea"> {form?.nextDomain?.name} should be... </label>
					<input id="idea" name="idea" type="text" />
					<input type="hidden" name="domainId" value={form?.nextDomain?.id} />
					<div class="dialog-actions">
						<button type="submit" class="dialog-primary"> Submit Idea </button>
						<button class="dialog-secondary" formaction="?/skipDomain"> Maybe for another domain </button>
					</div>
				</form>

				<button use:melt={$close} aria-label="close" class="dialog-close">
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
{:else}
	<!-- 404 from +page.server -->
{/if}

<style>
	h1 {
		font-size: var(--font-size-fluid-3);
		margin-block-end: 2rem;
	}

	h2 {
		max-inline-size: var(--size-header-3);
	}

	h3 {
		font-weight: var(--font-weight-7);
	}

	.wrapper {
		padding-inline: var(--size-fluid-4);
		padding-block-end: var(--size-fluid-6);
	}

	section {
		padding-block: var(--size-fluid-4);
	}

	form#submit-suggestion {
		max-width: min(100%, 80ch);
	}

	form p.info.notice button {
		display: inline;
		color: var(--pink-6);
		font-weight: var(--font-weight-8);
		text-decoration: wavy underline;
		text-underline-offset: 0.3rem;
		text-decoration-skip-ink: none;
		background: none;
		border: none;
		padding: 0;
		font-size: inherit;
		box-shadow: none;
		text-shadow: none;
		width: auto;
	}

	label {
		display: block;
		color: var(--text-1);
		font-weight: var(--font-weight-9);
		font-size: var(--font-size-fluid-2);
		margin-block: var(--size-fluid-2);
		line-height: 1.1;
	}

	input#idea {
		font-size: var(--font-size-4);
		margin-block-end: var(--size-fluid-1);
	}

	ul {
		padding: var(--size-fluid-2) var(--size-fluid-4);
		list-style: none;
		padding-inline: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--size-fluid-2);
		margin-block-start: 0;
		margin-block-end: var(--size-fluid-3);
	}

	ul > p {
		font-weight: var(--font-weight-3);
		text-wrap: balance;
	}

	.vote {
		display: flex;
		flex-direction: column;
		gap: 1px;
		color: var(--text-2);
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: var(--font-size-2);
		align-items: center;
		line-height: 1;
		margin: 0;
	}

	.vote button {
		background: none;
		border: none;
		padding: 0;
		font-size: var(--font-size-1);
		box-shadow: none;
		width: var(--size-4);
		height: var(--size-4);
		color: var(--text-2);
		transform: scaleX(125%);
	}

	.vote button.flip {
		transform: scaleX(125%) rotate(180deg);
	}

	.vote button.voted {
		color: var(--pink-8);
		text-shadow:
			0 0 3px var(--pink-5),
			0 0 8px var(--pink-6);
	}

	.vote ~ span {
		margin-block-end: 0.25rem;
	}

	p.error {
		padding-block-end: var(--size-fluid-1);
	}

	sup {
		margin-inline-start: 0.25em;
		color: var(--pink-6);
	}

	.notice {
		font-size: var(--font-size-2);
		margin-block: var(--size-6);
	}

	.dialog ul {
		padding-block-start: 0;
		list-style: disc inside;
	}

	.dialog li {
		display: list-item;
		padding-inline: var(--size-4);
		font-size: var(--font-size-2);
		margin: 0;
	}

	.dialog label {
		font-size: var(--font-size-3);
	}

	.dialog input {
		background-color: var(--surface-3);
		outline: solid var(--surface-4);
		caret-color: var(--pink-6);
	}

	.dialog input:focus {
		outline: solid var(--pink-6);
	}

	.dialog-actions {
		width: 100%;
		justify-content: flex-start;
		flex-direction: row-reverse;
	}
</style>
