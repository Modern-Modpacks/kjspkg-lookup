<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import consts from '$lib/consts';
	import { Author, Organizations, IconBlank, PackageList } from '$lib/index';
	import { contextMenu } from '$lib/overlays/contextMenu';
	import {
		currentSearchStore,
		ghApiLoginStore,
		packageListStore,
		packageStatusStore,
		userPreferencesStore
	} from '$lib/stores';
	import {
		filterObjectByKey,
		filterPkgsByAuthor,
		generateInputString,
		initPackageList,
		parseInputString
	} from '$lib/utils';
	import { IconCheck, IconClearAll, IconHome, IconLayoutDashboard } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';

	let state: 'loading' | 'ready' | 'fail' = $packageListStore == undefined ? 'loading' : 'ready';

	onMount(async () => {
		state = (await initPackageList()) ? 'ready' : 'fail';
		$currentSearchStore = $page.url.searchParams.get('q') ?? '';
	});

	$: queryParams = parseInputString($currentSearchStore);

	$: $packageStatusStore.search.d = Object.entries(
		(!queryParams.ROOT
			? $packageListStore
			: filterObjectByKey($packageListStore ?? {}, queryParams.ROOT)) ?? {}
	);
	$: $packageStatusStore.search.v =
		$packageStatusStore.search.d.length != Object.keys($packageListStore ?? {}).length;

	$: filteredAuthor = filterPkgsByAuthor(queryParams.author);

	$: resultedFilter = queryParams.author ? filteredAuthor : $packageStatusStore.search.d;

	/////////////////////////////////////

	let optionsHeader: HTMLDivElement;
	const observer = new IntersectionObserver(
		([e]) => {
			// e.target.classList.toggle('backdrop-brightness-75', e.intersectionRatio < 1);
			e.target.classList.toggle('border-b', e.intersectionRatio < 1);
		},
		{ threshold: [1] }
	);
	$: optionsHeader ? observer.observe(optionsHeader) : '';
</script>

<svelte:head>
	<title>{$currentSearchStore || 'Search'} - KJSPKG Lookup</title>
</svelte:head>

<div class="flex flex-wrap gap-2">
	{#if $currentSearchStore}
		<button
			class="variant-soft-secondary btn w-fit hover:variant-filled-primary"
			on:click={() => goto(base + '/s')}
		>
			<IconClearAll class="mr-2" />
			Clear filters
		</button>
	{:else}
		<button
			class="variant-soft-secondary btn w-fit hover:variant-filled-primary"
			on:click={() => goto(base + '/home')}
		>
			<IconHome class="mr-2" />
			Go home
		</button>
	{/if}
	<button
		class="variant-soft-secondary btn w-fit hover:variant-filled-primary"
		on:click={() => ($userPreferencesStore.compact = !$userPreferencesStore.compact)}
	>
		<IconLayoutDashboard class="mr-2" />
		<span class="inline md:hidden">
			{$userPreferencesStore.compact ? 'Show icons' : 'Hide icons'}
		</span>
		<span class="hidden md:inline">
			{$userPreferencesStore.compact ? 'Use list view' : 'Use compact view'}
		</span>
	</button>
</div>

<div
	class="sticky top-[-1px] z-10 justify-between border-surface-600 bg-surface-900 p-2 pt-[calc(1rem_+_1px)] backdrop-blur rounded-bl-container-token rounded-br-container-token md:flex"
	bind:this={optionsHeader}
>
	<h1 class="h3">
		{#if !$currentSearchStore}
			Found <span>{$packageStatusStore.search.d.length}</span> packages
		{:else}
			Found
			<span>{resultedFilter.length}</span>
			<a href="{base}/s" class="anchor no-underline">
				{resultedFilter.length == 1 ? 'package' : 'packages'}
			</a>

			{#if queryParams.author && (filteredAuthor.length > 0 || queryParams.author==$ghApiLoginStore)}
				<button
					class="transition-all hover:variant-filled-error hover:rounded hover:p-1 hover:px-2 hover:line-through"
					on:click={() => {
						let q = queryParams;
						delete q.author;
						goto(`${base}/s?q=${generateInputString(q)}`);
					}}
				>
					made by {queryParams.author}
				</button>
			{/if}
			{#if queryParams.ROOT != ''}
				matching
				<button
					class="transition-all hover:variant-filled-error hover:rounded hover:p-1 hover:px-2 hover:line-through"
					on:click={() => {
						let q = queryParams;
						q.ROOT = '';
						goto(`${base}/s?q=${generateInputString(q)}`);
					}}
				>
					{queryParams.ROOT}
				</button>
			{/if}
			{#if queryParams._details == 'i'}
				<button
					class="transition-all hover:variant-filled-error hover:rounded hover:p-1 hover:px-2 hover:line-through"
					on:click={() => {
						let q = queryParams;
						delete q._details;
						goto(`${base}/s?q=${generateInputString(q)}`);
					}}
				>
					(detailed)
				</button>
			{/if}
		{/if}
	</h1>

	<div class="flex flex-wrap space-x-2">
		<button
			class="anchor"
			use:contextMenu={{
				initiator: 'left',
				items: [
					// @ts-expect-error me lazy. be like me.
					...[
						{
							label: 'Name (a-z)',
							name: 'name'
						},
						{
							label: 'Author (a-z)',
							name: 'author'
						},
						{
							label: 'Download count',
							name: 'downloads'
						},
						{
							label: 'Views',
							name: 'views'
						}
					].map(({ label, name }) => ({
						type: 'ITEM',
						label,
						icon: $userPreferencesStore.sortBy == name ? IconCheck : IconBlank,
						// @ts-expect-error me lazy. be like me.
						action: () => ($userPreferencesStore.sortBy = name)
					})),
					// @ts-expect-error me lazy. be like me.
					{ type: 'SEPARATOR' },
					{
						// @ts-expect-error me lazy. be like me.
						type: 'ITEM',
						label: 'Show details',
						icon: queryParams._details == 'i' ? IconCheck : IconBlank,
						action: () => {
							let q = queryParams;
							if (queryParams._details == 'i') delete q._details;
							else q._details = 'i';
							goto(`${base}/s?q=${generateInputString(q)}`);
						}
					}
				]
			}}
		>
			{$userPreferencesStore.sortBy != ''
				? `Sorted by ${$userPreferencesStore.sortBy}`
				: 'Unsorted'}
		</button>
	</div>
</div>

{#if queryParams.author && (filteredAuthor.length > 0 || queryParams.author==$ghApiLoginStore)}
	<div class="grid grid-cols-[1fr_min-content] items-start gap-x-2">
		<Author author={queryParams.author} c={filteredAuthor.length} />
		<Organizations author={queryParams.author} />
	</div>
{/if}

{#if state == 'loading'}
	<dl
		class="grid grid-cols-1 gap-2"
		class:lg:grid-cols-2={!$userPreferencesStore.compact}
		class:md:grid-cols-2={$userPreferencesStore.compact}
		class:lg:grid-cols-3={$userPreferencesStore.compact}
	>
		{#each Array(5) as _}
			<div class="placeholder h-24 w-full animate-pulse rounded-container-token" />
		{/each}
	</dl>
{:else if state == 'ready' && resultedFilter.length == 0}
	{#if queryParams.author!=$ghApiLoginStore}
		<p>Here, have a cookie, if that makes you feel any better: 🍪</p>
		<p class="text-sm opacity-50">
			Fun fact: You can use '@author:name' to view packages made by an author. What 'bout using
			'@details' to get technical details on each package?
		</p>
	{:else}
		<p class="opacity-50 text-center">
			Looks like you don't have any approved packages published to KJSPKG.
			How sad!
		</p>
	{/if}
{:else if state == 'ready'}
	<dl
		class="grid grid-cols-1 gap-2"
		class:lg:grid-cols-2={!$userPreferencesStore.compact}
		class:md:grid-cols-2={$userPreferencesStore.compact}
		class:lg:grid-cols-3={$userPreferencesStore.compact}
	>
		<PackageList
			p={resultedFilter}
			showAvatar={!queryParams.author}
			showName={!queryParams.author}
			showDetails={queryParams._details == 'i'}
			sortBy={$userPreferencesStore.sortBy}
			compact={$userPreferencesStore.compact}
		/>
	</dl>
{:else if state == 'fail'}
	<p>Something went wrong</p>
{/if}
