<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import AuthRequired from '$lib/AuthRequired.svelte';
	import { ghApiLoginStore } from '$lib/stores';

	let renderErrPage = false;
	setTimeout(() => {
		renderErrPage = true;
	}, 100);

	// TODO: add a page if login is not found
	ghApiLoginStore.subscribe((login) => {
		if (login != null) goto(`${base}/s/?q=@author:${login}`);
	});
</script>

{#if renderErrPage}
	<AuthRequired />
{/if}
