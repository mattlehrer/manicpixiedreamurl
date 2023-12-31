<script lang="ts">
	import Landing from '$lib/components/layout/Landing.svelte';
	import { dashboardSites } from '$lib/config';
	import type { PageData, ActionData } from './$types';
	import NetworkHeader from '$lib/components/NetworkHeader.svelte';
	import DomainReason from '$lib/components/DomainReason.svelte';
	import { enhance } from '$app/forms';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import { onMount } from 'svelte';

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
			<h3>Vote on the best ideas so far:</h3>
			<ul>
				{#each data.ideas ?? [] as idea}
					<!-- {@const score = idea.votes.reduce((acc, vote) => acc + vote.type, 0)} -->
					<li>{idea.text}</li>
				{/each}
			</ul>

			<form id="submit-suggestion" action="?/addSuggestion" method="post" use:enhance>
				<label for="idea"> What's your best idea for this domain? </label>
				{#if form?.invalid}<p class="error">That wasn't a good idea. You can do better.</p>{/if}
				{#if form?.notUnique}<p class="error">Someone has already suggested that idea. Upvote it instead!</p>{/if}
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
	}

	li:first-child {
		margin-block-start: 0;
	}
</style>
