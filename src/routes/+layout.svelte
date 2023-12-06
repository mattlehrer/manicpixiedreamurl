<script lang="ts">
	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';

	import '../app.css';
</script>

<div>
	<main>
		<slot />
	</main>
</div>

<style>
	main {
		padding: var(--size-fluid-4);
	}
</style>
