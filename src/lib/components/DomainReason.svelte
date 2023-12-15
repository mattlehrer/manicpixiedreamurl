<script lang="ts">
	export let username: string;
	export let reason: string;
</script>

<p>{username} bought this domain {reason ? `because ${reason}` : `and we don't know why yet.`}</p>

<style>
	p {
		margin-block-start: var(--size-3);
	}
</style>
