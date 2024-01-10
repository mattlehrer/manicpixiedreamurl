<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<h1>Sign in</h1>
<form method="post" use:enhance>
	{#if form?.invalidUsername}<p class="error">Your username is between 3 and 30 characters.</p>{/if}
	{#if form?.invalidPassword}<p class="error">Enter your password.</p>{/if}
	{#if form?.message}<p class="error">{form.message}</p>{/if}
	<label for="username">Username</label>
	<input name="username" id="username" value={form?.username ?? ''} /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<button type="submit">Sign in</button>
</form>
<a href="/signup">Need an account? Sign up</a>
<a href="/reset-password">Forgot your password? Reset it</a>

<style lang="postcss">
	a {
		display: block;
		margin-block-start: var(--size-3);
	}

	form {
		margin-block-end: var(--size-6);
	}
</style>
