<script lang="ts">
	import LoadingSpinner from '$lib/assets/LoadingSpinner.svelte';
	import type { Domain } from '$lib/server/handlers';

	let { domain } = $props<{ domain: Domain }>();

	let bareDns: boolean | undefined = $state(undefined);
	let wwwDns: boolean | undefined = $state(undefined);

	$effect(() => {
		if (!domain.bareDNSisVerified) {
			fetch('/api/dns', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ domain: domain.name, id: domain.id }),
			}).then((res) => {
				if (res.ok) {
					res.json().then(({ ok }) => {
						bareDns = ok;
					});
				}
			});
		} else {
			bareDns = true;
		}
		if (!domain.wwwDNSisVerified) {
			fetch('/api/dns', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ domain: `www.${domain.name}`, id: domain.id }),
			}).then((res) => {
				if (res.ok) {
					res.json().then(({ ok }) => {
						wwwDns = ok;
					});
				}
			});
		} else {
			wwwDns = true;
		}
	});
</script>

{#if bareDns !== undefined && wwwDns !== undefined}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		><path stroke={bareDns ? 'var(--green-5)' : 'var(--red-5)'} d="M18 6 7 17l-5-5" /><path
			stroke={wwwDns ? 'var(--green-5)' : 'var(--red-5)'}
			d="m22 10-7.5 7.5L13 16"
		/></svg
	>
	<p class="sr-only">
		DNS configuration {!(bareDns && wwwDns) ? 'is good.' : 'needs work.'}
	</p>
{:else}
	<LoadingSpinner />
	<span class="sr-only">Loading dns data...</span>
{/if}

<style lang="postcss">
	.success {
		font-size: var(--font-size-3);
		font-weight: var(--font-weight-3);
		color: var(--green-6);
	}
	.instructions {
		font-weight: var(--font-weight-3);
		font-size: var(--font-size-3);
	}

	.instructions ~ .notice {
		font-size: var(--font-size-3);
	}

	.instructions svg {
		display: inline;
		margin-bottom: -0.25rem;
	}

	label {
		display: block;
		margin-block-start: var(--size-2);
	}
	table {
		margin-block-start: var(--size-6);
		width: 100%;
	}

	td > textarea {
		padding: 0;
		margin: 0;
	}

	th:first-child,
	td:first-child {
		width: 8rem;
		text-align: left;
		padding-inline: var(--size-1);
	}

	.dns-column {
		width: 3rem;
	}

	.wider {
		min-width: 100%;
		text-align: left;
		padding-inline: var(--size-2);
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.wider textarea {
		margin-inline-start: calc(-1 * var(--size-2));
		width: 85%;
	}

	.reason {
		background-color: var(--surface-2);
		padding: var(--size-4);
		width: max-content;
		border-radius: var(--radius-3);
		margin-block-start: var(--size-2);
		margin-inline-start: calc(-1 * var(--size-4));
	}

	td textarea ~ svg:not(.spin) {
		display: inline-block;
		animation:
			1s var(--animation-fade-in) forwards,
			6s var(--animation-fade-out) forwards;
	}
</style>
