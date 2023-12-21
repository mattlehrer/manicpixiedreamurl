<script lang="ts">
	// import { dashboardSites } from '$lib/config';

	// async function submitSuggestion(e) {
	// 	e.preventDefault();
	// 	const form = e.target;
	// 	const formData = new FormData(form);

	// 	const formDataObject = Object.fromEntries(formData.entries());
	// 	const res = await fetch(`${dashboardSites[0]}/api/network/suggestion`, {
	// 		method: 'POST',
	// 		mode: 'cors',
	// 		credentials: 'include',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'X-Madeup': 'not-simple',
	// 		},
	// 		body: JSON.stringify(formDataObject),
	// 	}).catch((e) => console.error(e));
	// 	console.log({ ok: res?.ok });
	// }
	let { form } = $props();
</script>

<ul>
	<li>Uber for shoes</li>
	<li>Uber for shoes</li>
	<li>Uber for shoes</li>
</ul>

<!-- <form id="submit-suggestion" onsubmit={submitSuggestion} method="post"> -->
<form id="submit-suggestion" action="/network?/addSuggestion" method="post">
	{#if form?.invalid}<p class="error">Please enter a valid domain name.</p>{/if}
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
