<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { dev } from '$app/environment';

	export let form: ActionData;
</script>

<svelte:head>
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</svelte:head>

<h1>Sign in</h1>
<form method="post" use:enhance>
	{#if form?.invalidUsername}<p class="error">Your username is between 3 and 30 characters.</p>{/if}
	{#if form?.invalidPassword}<p class="error">Enter your password.</p>{/if}
	{#if form?.message}<p class="error">Incorrect username or password.</p>{/if}
	{#if form?.serverError}<p class="error">Something went wrong. Please try again.</p>{/if}
	<label for="username">Username</label>
	<input name="username" id="username" value={form?.username ?? ''} /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	{#if !dev}
		<div
			class="cf-turnstile"
			data-appearance="interaction-only"
			data-sitekey={PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
		></div>
	{/if}
	<button type="submit">Sign in</button>
</form>
<a href="/signup">Create an account</a>
