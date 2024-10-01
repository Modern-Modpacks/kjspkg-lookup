<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(base + "/" + $page.params.path + $page.url.searchParams + $page.url.hash);
	});
</script>
