<script lang="ts">
	import { browser } from '$app/environment';
	import LoadingSpinner from '$lib/assets/LoadingSpinner.svelte';
	import type { Domain } from '$lib/server/handlers';

	export let domain: Domain;

	let bareDns: boolean | undefined = undefined;
	let wwwDns: boolean | undefined = undefined;

	$: if (browser && !domain.bareDNSisVerified) {
		fetch('/api/dns', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ domain: domain.name, id: domain.id }),
		})
			.then((res) => {
				if (res.ok) {
					res.json().then(({ ok }) => {
						bareDns = ok;
						domain.bareDNSisVerified = ok;
					});
				} else {
					bareDns = false;
				}
			})
			.catch((e) => {
				console.log(e);
				bareDns = false;
			});
	} else {
		bareDns = true;
	}

	$: if (browser && !domain.wwwDNSisVerified) {
		fetch('/api/dns', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ domain: `www.${domain.name}`, id: domain.id }),
		})
			.then((res) => {
				if (res.ok) {
					res.json().then(({ ok }) => {
						wwwDns = ok;
						domain.wwwDNSisVerified = ok;
					});
				} else {
					wwwDns = false;
				}
			})
			.catch((e) => {
				console.log(e);
				wwwDns = false;
			});
	} else {
		wwwDns = true;
	}
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
