<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { HeaderBar, Sidebar } from '$lib/index';
	import ContextMenu from '$lib/overlays/ContextMenu.svelte';
	import { userPreferencesStore } from '$lib/stores';
	import { AppShell, Modal, ProgressRadial, Toast, initializeStores } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	import '../app.pcss';

	initializeStores();

	onMount(() => {
		if ($userPreferencesStore.lightMode) document.documentElement.classList.remove('dark');
		document.body.dataset.theme = $userPreferencesStore.theme ?? 'kjspkg';
	});

	let navigating = false;
	beforeNavigate(() => (navigating = true));
	afterNavigate(() => (navigating = false));
</script>

<Toast position="br" max={8} />
<ContextMenu />
<Modal />

{#if navigating}
	<div
		class="card variant-soft-success absolute bottom-8 right-8 z-40 flex w-16 p-4"
		in:fly={{ x: 40, delay: 200 }}
		out:fly={{ x: 40 }}
	>
		<ProgressRadial stroke={40} meter="stroke-success-500" track="stroke-success-500/30" />
	</div>
{/if}

<AppShell slotSidebarLeft="hidden xl:block" slotPageFooter="p-2 flex justify-between">
	<svelte:fragment slot="header">
		<HeaderBar />
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<Sidebar />
	</svelte:fragment>

	<div class="container mx-auto space-y-4 p-10">
		{#key $page.url.pathname}
			<slot />
		{/key}
	</div>

	<svelte:fragment slot="pageFooter">
		<span class="hidden md:inline">
			<a
				href="https://github.com/Modern-Modpacks/kjspkg"
				class="anchor no-underline"
				target="_blank">KJSPKG @ GitHub</a
			>
			&bull;
			<a
				href="https://github.com/Modern-Modpacks/kjspkg-lookup"
				class="anchor no-underline"
				target="_blank">KJSPKG Lookup @ GitHub</a
			>
			&bull;
			<a href="https://modernmodpacks.site" class="anchor no-underline" target="_blank"
				>Modern Modpacks</a
			>
		</span>

		<span class="hidden text-sm opacity-50 md:inline">
			Website designed with love by <a
				href="https://github.com/tizu69"
				class="anchor no-underline"
				target="_blank">tizu69</a
			> &lt;3
		</span>
	</svelte:fragment>
</AppShell>