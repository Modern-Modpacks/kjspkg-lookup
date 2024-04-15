<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import consts from '$lib/consts';
	import { langKeyStore, packageStatStore } from '$lib/stores';
	import { packageNameToReadableFormat } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let p: [string, string][] = [];
	/** name and author are sorted alphabetically. */
	export let sortBy: '' | 'name' | 'author' | 'downloads' | 'views' = '';
	export let maxCount = Infinity;
	export let startFrom = 0;
	export let showAvatar = true;
	export let showDetails = true;
	export let showName = true;
	export let compact = false;
	export let customHeight : number | null = null;

	$: sortedP = (() => {
		const alphabetic = [...p].sort((_a, _b) => {
			const a = _a[0];
			const b = _b[0];

			return a == b ? 0 : a < b ? -1 : 1;
		});
		switch (sortBy) {
			case '':
				return p;
			case 'name':
				return alphabetic;
			case 'author':
				return [...alphabetic].sort((_a, _b) => {
					const a = _a[1].match(consts.LOCATOR_REGEX)![1];
					const b = _b[1].match(consts.LOCATOR_REGEX)![1];

					return a == b ? 0 : a < b ? -1 : 1;
				});
			case 'downloads':
			case 'views':
				return [...alphabetic].sort((_a, _b) => {
					const a = $packageStatStore[sortBy as 'downloads' | 'views'][_a[0]] ?? 0;
					const b = $packageStatStore[sortBy as 'downloads' | 'views'][_b[0]] ?? 0;

					return a == b ? 0 : a < b ? 1 : -1;
				});
			default:
				return [];
		}
	})();
</script>

{#each [...sortedP].slice(startFrom, maxCount) as [name, locator], i (name)}
	{@const locatorInfo = locator.match(consts.LOCATOR_REGEX) ?? [null, null, null, null, null]}
	{@const author = locatorInfo[1]}
	{@const repo = locatorInfo[2]}
	{@const branch = locatorInfo[3]}
	{@const path = locatorInfo[4]}

	{@const statDownloads = $packageStatStore.downloads[name] ?? 0}
	{@const statViews = $packageStatStore.views[name] ?? 0}

	<a
		href={`${base}/p?id=${encodeURIComponent(name)}`}
		class="card flex p-4 hover:variant-soft-primary"
		class:flex-col={compact}
		on:click={() => dispatch('select', name)}
		class:!variant-filled-primary={$page.url.searchParams.get('id') == name}
		animate:flip={{ duration: 500 }}
		transition:fade={{ duration: 300 }}
		style={customHeight!=null ? `height: ${customHeight}rem` : ''}
	>
		{#if showAvatar && !compact}
			<img
				src={consts.AVATARS + author}
				alt="author's profile avatar"
				class="my-auto mr-4 aspect-square h-8 rounded-token"
				in:slide={{ axis: 'x' }}
			/>
		{/if}
		<dl class="my-auto">
			<dt class="mb-1 select-text font-bold">{packageNameToReadableFormat(name)}</dt>
			<dd class="text-sm opacity-50">
				{#if branch && showDetails}
					{$langKeyStore['list.detailed.on_branch']} <span class="select-text">{branch.substring(1)}</span>
				{/if}
				{#if path && showDetails}
					{$langKeyStore['list.detailed.at_path']} <span class="select-text">{path.substring(1)}</span>
				{/if}
				{#if name != repo && showDetails}
					{$langKeyStore['list.detailed.in_repo']} <span class="select-text">{repo}</span>
				{/if}

				{#if showName}
					{$langKeyStore['list.by']} <span class="select-text">{author}</span>
				{/if}
			</dd>
			<dd class="text-sm opacity-50">
				<span>{statDownloads} {statDownloads == 1 ? $langKeyStore['list.download_singluar'] : $langKeyStore['list.download_plural']}</span> &bull;
				<span>{statViews} {statViews == 1 ? $langKeyStore['list.view_singular'] : $langKeyStore['list.view_plural']}</span>
			</dd>
		</dl>
	</a>
{/each}
