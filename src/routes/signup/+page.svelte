<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

<h1>Sign up</h1>
<form method="post" use:enhance>
	{#if form?.invalidUsername}<p class="error">Your username should be between 3 and 30 characters.</p>{/if}
	{#if form?.invalidEmail}<p class="error">Enter a valid email.</p>{/if}
	{#if form?.duplicate}<p class="error">
			An account with that username or email already exists. Do you need to <a href="/login">sign in</a>?
		</p>{/if}
	{#if form?.invalidPassword}<p class="error">Enter a password longer than 4 characters.</p>{/if}
	{#if form?.serverError}<p class="error">Something went wrong. Please try again.</p>{/if}
	<label for="username">Username</label>
	<input name="username" id="username" /><br />
	<label for="email">Email</label>
	<input name="email" id="email" /><br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" /><br />
	<input type="submit" />
</form>
<a href="/login">Sign in</a>
