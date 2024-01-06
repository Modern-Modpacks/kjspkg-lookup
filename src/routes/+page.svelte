<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { userPreferencesStore } from '$lib/stores';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!$userPreferencesStore.alreadyVisited) {
			userPreferencesStore.update((prev) => ({ ...prev, alreadyVisited: true }));
			goto(base + '/home');
			return;
		}

		goto(base + '/s');
	});
</script>
