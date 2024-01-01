<script lang="ts">
	import Landing from '$lib/components/layout/Landing.svelte';
	import { dashboardSites } from '$lib/config';
	import type { PageData, ActionData } from './$types';
	import NetworkHeader from '$lib/components/NetworkHeader.svelte';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { enhance } from '$app/forms';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';

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
</script>

{#if data.origin && dashboardSites.includes(data.origin)}
	<Landing />
{:else if data.domain !== undefined}
	<NetworkHeader />
	<div class="wrapper">
		<h1>Welcome to {data.host}</h1>
		<DomainReason reason={data.domain.reason} />
		<section>
			<h2>What do you wish you found at this domain?</h2>
			{#if data.loggedIn && !data.isEmailVerified}
				{JSON.stringify(data)}
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
			<p></p>
			<ul>
				{#each data.ideas ?? [] as idea}
					{@const score = idea.votes.reduce((acc, vote) => acc + vote.type, 0)}
					{@const existingVote = data.userId && idea.votes.find((vote) => vote.userId === data.userId)}
					<li>
						<form class="vote" method="post" use:enhance>
							<input type="hidden" name="idea" value={idea.id} />
							<button
								class:voted={existingVote && existingVote?.type === 1}
								formaction={existingVote && existingVote?.type === 1 ? '?/unvote' : '?/upvote'}>^</button
							>
							<span style={`margin-left: ${score < 0 ? '-1ch' : '0'}`}>{score}</span>
							<button
								class="flip"
								class:voted={existingVote && existingVote?.type === -1}
								formaction={existingVote && existingVote?.type === -1 ? '?/unvote' : '?/downvote'}>^</button
							>
						</form>
						<span>
							{idea.text}
						</span>
					</li>
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
	</div>
{:else}
	<!-- 404 from +page.server -->
{/if}

<style>
	nav {
		display: flex;
		justify-content: end;
		align-items: center;
		padding-inline: var(--size-fluid-2);
		padding-block: var(--size-fluid-2);
	}

	nav a,
	nav a:visited {
		color: var(--text-1);
	}

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
		padding-block-end: var(--size-fluid-2);
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
		font-color: var(--text-1);
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
		margin-block-end: var(--size-fluid-1);
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
		color: var(--pink-7);
		text-shadow:
			0 0 3px var(--pink-5),
			0 0 10px var(--pink-7);
	}

	.vote ~ span {
		margin-block-end: 0.25rem;
	}

	p.error {
		padding-block-end: var(--size-fluid-1);
	}
</style>
