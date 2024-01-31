<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let pwd: string;
	let pwdConfirm: string;
</script>

<h1>Set a new password</h1>
<form method="post" use:enhance>
	{#if form?.invalidPassword}<p class="error">
			Enter a password longer than 4 characters and the same in the confirmation field.
		</p>{/if}
	{#if form?.invalidToken}<p class="error">That link is invalid or has expired. Please request a new one.</p>{/if}
	{#if form?.serverError}<p class="error">Something went wrong. Please try again.</p>{/if}
	{#if form?.success}<p class="notice success">Confirmed your new password and you are now logged in.</p>{/if}
	<label for="password">Password</label>
	<input bind:value={pwd} type="password" name="password" id="password" /><br />
	<label for="password-confirm">Confirm Password</label>
	<input bind:value={pwdConfirm} type="password" name="password-confirm" id="password-confirm" /><br />
	<button disabled={pwd !== pwdConfirm || form?.success} type="submit">Set new password</button>
</form>
