<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import consts from '$lib/consts';
	import { Author, Organizations, IconBlank, PackageList } from '$lib/index';
	import { contextMenu } from '$lib/overlays/contextMenu';
	import {
		currentSearchStore,
		ghApiKeyStore,
		ghApiLoginStore,
		langKeyStore,
		packageListStore,
		packageStatusStore,
		userPreferencesStore
	} from '$lib/stores';
	import {
		filterObjectByKey,
		filterPkgsByAuthor,
		generateInputString,
		getNonEmptyOrgsWithPackageCount,
		initPackageList,
		isAutomatinUp,
		parseInputString
	} from '$lib/utils';
	import { IconCheck, IconClearAll, IconHome, IconLayoutDashboard } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import { vsprintf } from 'sprintf-js';

	let state: 'loading' | 'ready' | 'fail' = $packageListStore == undefined ? 'loading' : 'ready';

	onMount(async () => {
		state = (await initPackageList()) ? 'ready' : 'fail';
		$currentSearchStore = $page.url.searchParams.get('q') ?? '';
	});

	$: queryParams = parseInputString($currentSearchStore);
	let largeScreen = matchMedia('(min-width: 1024px)').matches;
	window.onresize = () => {largeScreen = matchMedia('(min-width: 1024px)').matches}

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

<div class="flex flex-wrap gap-2 mb-2">
	{#if $currentSearchStore}
		<button
			class="variant-soft-secondary btn w-fit hover:variant-filled-primary"
			on:click={() => goto(base + '/s')}
		>
			<IconClearAll class="mr-2" />
			{$langKeyStore['search.clear_filters']}
		</button>
	{/if}
	<button
		class="variant-soft-secondary btn w-fit hover:variant-filled-primary"
		on:click={() => ($userPreferencesStore.compact = !$userPreferencesStore.compact)}
	>
		<IconLayoutDashboard class="mr-2" />
		<!-- <span class="inline md:hidden">
			{$userPreferencesStore.compact ? 'Show icons' : 'Hide icons'}
		</span> -->
		<span class="hidden md:inline">
			{$userPreferencesStore.compact ? $langKeyStore['search.use_view.list'] : $langKeyStore['search.use_view.compact']}
		</span>
	</button>
</div>

{#await isAutomatinUp() then automatinUp}
	{#if !automatinUp}
		<div class="variant-filled-error rounded p-2 px-3">
			<h1 class="h4 font-bold">{$langKeyStore['errors.automatin_down']} ¯\_(ツ)_/¯</h1>
			<p>{$langKeyStore['errors.automatin_down.details']} <a class="anchor" href={consts.DISCORD_URL}>{$langKeyStore['errors.automatin_down.server']}</a>.</p>
		</div>
	{/if}
{/await}

<div
	class="sticky top-[-1px] z-10 justify-between border-surface-600 bg-surface-900 p-2 backdrop-blur rounded-bl-container-token rounded-br-container-token md:flex"
	bind:this={optionsHeader}
>
	<h1 class="h3">
		{#if !$currentSearchStore}
			{@html vsprintf($langKeyStore['search.found_plural'], [$packageStatusStore.search.d.length])} {$langKeyStore['search.package_plural']}
		{:else}
			{@html vsprintf(resultedFilter.length == 1 ? $langKeyStore['search.found_singular'] : $langKeyStore['search.found_plural'], [resultedFilter.length])}
			<a href="{base}/s" class="anchor no-underline">
				{resultedFilter.length == 1 ? $langKeyStore['search.package_singular'] : $langKeyStore['search.package_plural']}
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
					{$langKeyStore['search.made_by']} {queryParams.author}
				</button>
			{/if}
			{#if queryParams.ROOT != ''}
				{$langKeyStore['search.matching']}
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
					({$langKeyStore['search.detailed']})
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
						'name',
						'author',
						'downloads',
						'views'
					].map(name  => ({
						type: 'ITEM',
						label: $langKeyStore[`search.sort_type.${name}`],
						icon: $userPreferencesStore.sortBy == name ? IconCheck : IconBlank,
						// @ts-expect-error me lazy. be like me.
						action: () => ($userPreferencesStore.sortBy = name)
					})),
					// @ts-expect-error me lazy. be like me.
					{ type: 'SEPARATOR' },
					{
						// @ts-expect-error me lazy. be like me.
						type: 'ITEM',
						label: $langKeyStore[`search.show_details`],
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
				? `${$langKeyStore['search.sorted_by']} ${$langKeyStore[`search.sorted_by.${$userPreferencesStore.sortBy}`]}`
				: 'Unsorted'}
		</button>
	</div>
</div>

{#if queryParams.author && (filteredAuthor.length > 0 || queryParams.author==$ghApiLoginStore)}
	<!-- {#await getNonEmptyOrgsWithPackageCount('Gcat101', $ghApiKeyStore)} -->
	{#await getNonEmptyOrgsWithPackageCount(queryParams.author, $ghApiKeyStore)}
		<Author author={queryParams.author} c={filteredAuthor.length} />
	{:then orgs}
		<div class="grid lg:grid-cols-{orgs.length>0 ? 2 : 1} items-start gap-2">
			<div class="flex flex-col gap-2">
				<Author author={queryParams.author} c={filteredAuthor.length} />
				{#if largeScreen}
					<div class="grid grid-cols-2 gap-2">
						<PackageList
							p={resultedFilter}
							showAvatar={!queryParams.author}
							showName={!queryParams.author}
							showDetails={queryParams._details == 'i'}
							sortBy={$userPreferencesStore.sortBy}
							compact={$userPreferencesStore.compact}

							maxCount={Math.max(orgs.length-1, 0)}
							customHeight={5.7}
						/>
					</div>
				{/if}
			</div>
			{#if orgs.length>0}
				<Organizations orgs={orgs} />
			{/if}
		</div>
	{/await}
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
	{#if queryParams.author!=$ghApiLoginStore || queryParams.author==undefined}
		<p>{$langKeyStore['errors.package_not_found']}</p>
		<p class="text-sm opacity-50">{$langKeyStore['errors.package_not_found.details']}</p>
	{:else}
		<p class="opacity-50 text-center">{$langKeyStore['errors.no_packages_published']}</p>
	{/if}
{:else if state == 'ready'}
	<dl
		class="grid grid-cols-1 gap-2"
		class:lg:grid-cols-2={!$userPreferencesStore.compact}
		class:md:grid-cols-2={$userPreferencesStore.compact}
		class:lg:grid-cols-3={$userPreferencesStore.compact}
	>
		{#if queryParams.author!=null}
			{#await getNonEmptyOrgsWithPackageCount(queryParams.author, $ghApiKeyStore)}
				<PackageList
					p={resultedFilter}
					showAvatar={false}
					showName={false}
					showDetails={queryParams._details == 'i'}
					sortBy={$userPreferencesStore.sortBy}
					compact={$userPreferencesStore.compact}
				/>
			{:then orgs}
				<PackageList
					p={resultedFilter}
					showAvatar={false}
					showName={false}
					showDetails={queryParams._details == 'i'}
					sortBy={$userPreferencesStore.sortBy}
					compact={$userPreferencesStore.compact}

					startFrom={largeScreen && orgs.length>0 ? orgs.length-1 : 0}
				/>
			{/await}
		{:else}
			<PackageList
				p={resultedFilter}
				showDetails={queryParams._details == 'i'}
				sortBy={$userPreferencesStore.sortBy}
				compact={$userPreferencesStore.compact}
			/>
		{/if}
	</dl>
{:else if state == 'fail'}
	<p>{$langKeyStore['errors.something_went_wrong']}</p>
{/if}
