<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

{#if data.error}
	<section>
		<p class="notice error">
			{#if data.error === 'unverified-email'}
				You have registered by username and password with that email address, but you have not yet verified your email.
				In order to sign in with that provider, please check your inbox for the email confirmation message or sign in
				below and then request a new one.
			{/if}
		</p>
	</section>
{/if}

<h1>Sign in</h1>

{#if !data.error && data.error !== 'unverified-email'}
	<section class="oauth">
		<!-- <a href="/login/apple">Sign in with Apple</a> -->
		<!-- <a href="/login/google">Sign in with Google</a> -->
		<a href="/login/discord">Sign in with Discord</a>
		<a href="/login/github">Sign in with GitHub</a>
	</section>
{/if}

<hr />

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
	.oauth {
		padding-block: var(--size-6);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--size-3);
	}

	.oauth a {
		text-align: center;
		width: 100%;
		display: inline-block;
		background-color: var(--surface-2);
		padding: var(--size-2) var(--size-4);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-2);
	}

	a {
		display: block;
		margin-block-start: var(--size-3);
	}

	form {
		margin-block-end: var(--size-6);
	}
</style>
