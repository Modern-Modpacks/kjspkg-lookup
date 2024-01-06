<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import consts from '$lib/consts';
	import { userPreferencesStore } from '$lib/stores';

	if ($page.url.hash != '') {
		goto(base + `/p?id=${encodeURIComponent($page.url.hash.substring(1))}`);
	}
</script>

<svelte:head>
	<title>KJSPKG Lookup</title>
</svelte:head>

<img src={consts.LOGO} alt="logo" class="mx-auto aspect-square h-32 rounded-token" />
<h1 class="h1 text-center">KJSPKG Lookup</h1>

<hr />
<p class="text-center">
	This website serves as a means to share KJSPKG packages more easily. Use the search bar above to
	search for packages, or <a href="{base}/s" class="anchor">browse all packages</a>.
</p>
