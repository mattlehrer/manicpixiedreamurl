<script lang="ts">
	export let username: string;
	export let reason: string;
</script>

<p>{username} bought this domain because {reason}</p>

<style>
	p {
		margin-block-start: 0;
	}
</style>
