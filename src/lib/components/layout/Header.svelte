<script lang="ts">
	import { enhance } from '$app/forms';
	import Logo from '$lib/assets/mpdu_logo.svelte';

	export let username: string | undefined;
</script>

<header>
	<nav>
		<a href="/"><Logo /></a>
		{#if username}
			<div>
				<a href="/dashboard">Dashboard</a>
				<form method="post" action="/dashboard?/logout" use:enhance>
					<input type="submit" value="Sign out" />
				</form>
			</div>
		{:else}
			<div>
				<a href="/login">Sign in</a>
				<a href="/signup">Sign up</a>
			</div>
		{/if}
	</nav>
</header>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: var(--size-fluid-4);
		padding-block: var(--size-3);
	}

	a {
		text-decoration: none;
	}

	a:hover {
		color: var(--blue-7);
	}

	nav > div,
	form {
		display: flex;
		align-items: center;
		gap: var(--size-6);
		margin-block: 0;
	}

	nav > a {
		color: var(--text-1);
		font-size: var(--size-6);
		font-weight: bold;
	}

	a:visited {
		color: inherit;
	}

	input[type='submit'] {
		margin: 0;
	}
</style>
