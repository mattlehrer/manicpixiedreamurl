<script lang="ts">
	import { enhance } from '$app/forms';
	export let ideas: {
		text: string;
		id: string;
		votes: {
			id: string;
			type: number;
			createdAt: string | null;
			updatedAt: string | null;
			ideaId: string;
			userId: string;
		}[];
	}[];
</script>

<ul>
	{#each ideas ?? [] as idea}
		<!-- {@const score = idea.votes.reduce((acc, vote) => acc + vote.type, 0)} -->
		<li>{idea.text}</li>
	{/each}
</ul>

<!-- <form id="submit-suggestion" onsubmit={submitSuggestion} method="post"> -->
<form id="submit-suggestion" action="/network?/addSuggestion" method="post" use:enhance>
	<label for="idea"> What would you build? </label>
	<input type="text" name="idea" />
	<input type="submit" />
</form>

<style>
	form#submit-suggestion {
		max-width: 100%;
	}
	ul {
		padding: var(--size-fluid-2) var(--size-fluid-4);
	}

	li:first-child {
		margin-block-start: 0;
	}
</style>
