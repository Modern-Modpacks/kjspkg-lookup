<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import PackageList from './PackageList.svelte';
	import consts from '../consts';
	import { currentScrollPosition, packageStatusStore } from '../stores';

	$: hideConditionStatus =
		Object.values($packageStatusStore).filter(
			(v) => v.v && v.d.length > 0 && !v.hidePaths.includes($page.route.id!)
		).length == 0;
	// $: hideConditionBackStatus = $packageStatusStore.back.d.length < 2;

	$: sidebarHidden = consts.NO_SIDEBAR.includes($page.route.id!) || hideConditionStatus; // || hideConditionBackStatus;
</script>

{#if !sidebarHidden}
	{@const o = $packageStatusStore}
	<div
		class="flex h-full w-96 flex-col gap-2 overflow-y-scroll border-surface-800 p-2 {$currentScrollPosition.y >
		16
			? 'border-r'
			: 'border-none'}"
		transition:slide={{ axis: 'x' }}
	>
		<!-- {#if o.back.v && o.back.d.length > 1 && !o.back.hidePaths.includes($page.route.id ?? '') }
			<h3 class="h4 mt-4 text-center">Step back</h3>
			<PackageList
				p={o.back.d.filter((p) => p[0] != $page.url.searchParams.get('id'))}
			/>
		{/if} -->

		{#if o.search.v && o.search.d.length > 0 && !o.search.hidePaths.includes($page.route.id ?? '')}
			<h3 class="h4 mt-4 text-center">Search results</h3>
			<PackageList p={o.search.d} />
		{/if}
	</div>
{/if}
