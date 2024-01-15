<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

{#if data.error}
	<section>
		<p class="notice error">
			{#if data.error === 'oauth-unverified-email'}
				It looks like you have not verified your email address with that provider. Please either verify your email
				address there or sign up a different way below.
			{/if}
		</p>
	</section>
{/if}

<h1>Sign up</h1>

<section class="oauth">
	<a href="/login/google">Sign up with Google</a>
	<a href="/login/discord">Sign up with Discord</a>
	<a href="/login/github">Sign up with GitHub</a>
</section>

<hr />

<p>Or sign up with a password</p>
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
	<button type="submit">Sign up</button>
</form>
<a href={data.loginLink}>Already have an account? Sign in</a>

<style lang="postcss">
	a {
		display: block;
		margin-block-start: var(--size-3);
	}

	form {
		margin-block-end: var(--size-6);
	}
</style>
