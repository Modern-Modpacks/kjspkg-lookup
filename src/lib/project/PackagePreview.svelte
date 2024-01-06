<script lang="ts">
	import consts from '$lib/consts';
	import { packageStatStore } from '$lib/stores';
	import { markdownInline } from '$lib/utils';
	import { onMount } from 'svelte';

	export let locator: string;
	export let popupId: string;
	export let name: string;

	let thisPackage: { [k: string]: any } = {};
	let state: 'loading' | 'ready' | 'fail' = 'loading';

	let locatorInfo: RegExpMatchArray | [null, null, null, null, null] = [
		null,
		null,
		null,
		null,
		null
	];


	onMount(async () => {

		locatorInfo = locator.match(consts.LOCATOR_REGEX)!;

		const author = locatorInfo[1];
		const repo = locatorInfo[2];
		const branch = (locatorInfo[3]?.substring(1) ?? 'main') + '/'; // TODO: dynamic main branch name
		const path = (locatorInfo[4]?.substring(1) ?? '') + '/';

		try {
			const res = await fetch(
				`https://raw.githubusercontent.com/${author}/${repo}/${branch}${path}.kjspkg`
			);
			const json = await res.json();
			thisPackage = json;
			state = 'ready';
		} catch {
			state = 'fail';
		}
	});

	$: statDownloads = $packageStatStore.downloads[name] ?? 0;
	$: statViews = $packageStatStore.views[name] ?? 0;
</script>

<div
	class="card variant-glass-surface max-w-96 p-4 !rounded-container-token"
	data-popup={popupId}
	style="opacity: 0;"
>
	<dl>
		<dt class="text-sm opacity-50">Package preview</dt>
		{#if state == 'loading'}
			<dd
				class="style-markdown blockquote flex flex-col gap-1 border-l-primary-500 p-4 *:pointer-events-none"
			>
				<div class="placeholder animate-pulse" />
				<span class="text-sm">
					<div class="placeholder animate-pulse" />
					<div class="placeholder animate-pulse" />
					<div class="placeholder animate-pulse" />
				</span>
			</dd>
		{:else if state == 'ready'}
			<dd
				class="style-markdown blockquote flex flex-col gap-1 border-l-primary-500 p-4 *:pointer-events-none"
			>
				<span>{@html markdownInline(thisPackage.description)}</span>
				<span class="select-none text-sm opacity-50">
					<span>{statDownloads} downloads</span> &bull;
					<span>{statViews} views</span> &bull;
					<span>by {locatorInfo[1]}</span>
				</span>
			</dd>
		{:else if state == 'fail'}
			<dd>Something went wrong (this package doesn't seem to exist)</dd>
		{/if}
	</dl>
</div>
