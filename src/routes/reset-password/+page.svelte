<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

<h1>Reset your password</h1>
<form method="post" use:enhance>
	{#if form?.invalidEmail}<p class="notice error">Please enter a valid email.</p>{/if}
	{#if form?.serverError}<p class="notice error">Something went wrong. Please try again.</p>{/if}
	{#if form?.success}<p class="notice success">Please check your email for reset instructions.</p>{/if}
	<label for="email">Email</label>
	<input name="email" id="email" /><br />
	<button type="submit">Reset password</button>
</form>
