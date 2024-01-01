<script lang="ts">
	export let reason: string;

	if (reason.endsWith('.')) {
		reason = reason.slice(0, -1);
	}
</script>

<p class="reason">
	Someone bought this domain
	{#if reason}
		because <span>{reason}.</span>
	{:else}
		and we don't know why yet.
	{/if}
</p>

<style>
	p {
		margin-block: var(--size-3);
		font-size: var(--font-size-fluid-2);
		line-height: 1.1;
	}

	span {
		color: var(--pink-7);
		font-weight: bold;
	}
</style>
