<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { Dependency, ManagePackage } from '$lib';
	import consts from '$lib/consts';
	import { currentAuthorStore, langKeyStore, packageListStore, packageStatStore } from '$lib/stores';
	import {
		capitalizeFirstLetter,
		initPackageList,
		markdown,
		markdownInline,
		packageNameToReadableFormat
	} from '$lib/utils';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const toastStore = getToastStore();

	$: id = $page.params.id;

	let thisPackage: { [k: string]: any } = {};
	let state: 'loading' | 'ready' | 'fail' = 'loading';

	let locator: string = '';
	let locatorInfo: RegExpMatchArray | [null, null, null, null, null] = [
		null,
		null,
		null,
		null,
		null
	];
	let docs = '',
		docLoc = '',
		issueLink = '';

	onMount(async () => {
		if (!(await initPackageList())) return goto(base + '/s');

		if (!id) {
			state = 'fail';
			return goto(base + '/s');
		}

		locator = ($packageListStore ?? {})[id ?? ''];
		if (!locator) {
			state = 'fail';
			return goto(base + '/s');
		}

		locatorInfo = locator.match(consts.LOCATOR_REGEX)!;

		const author = locatorInfo[1];
		const repo = locatorInfo[2];
		const path = (locatorInfo[3]?.substring(1) ?? '') + '/';
		const branch = (locatorInfo[4]?.substring(1) ?? 'main') + '/'; // TODO: dynamic main branch name

		try {
			const res = await fetch(
				`https://raw.githubusercontent.com/${author}/${repo}/${branch}${path}.kjspkg`
			);
			const json = await res.json();
			thisPackage = json;
			state = 'ready';
		} catch {
			state = 'fail';
			return goto(base + '/s');
		}

		$currentAuthorStore = author ?? '';

		/* if (!$packageStatusStore.back.d.some((p) => p[0] == id))
			$packageStatusStore.back.d = [
				...$packageStatusStore.back.d,
				...$packageStatusStore.search.d.filter((p) => p[0] == id)
			]; */

		issueLink = `https://github.com/${author}/${repo}/issues`;
		docLoc = `https://github.com/${author}/${repo}/blob/${branch}${path}/README.md`;

		(async () => { try {
			const targetUrl = docLoc.replace(
				new RegExp(consts.DOCS_URL_REGEX),
				'raw.githubusercontent.com/$1/$2'
			);

			const res = await fetch(targetUrl);
			if (!res.ok) return;

			const text = await res.text();
			docs = markdown(text.replace(/(\!\[.*]\()(\.\/)(.*\))/g, `$1https://raw.githubusercontent.com/${author}/${repo}/${branch}/$3`));
		} catch {} })()

		try {
			const res = await fetch(consts.AUTOMATIN_URL + `?stat=views&id=${id}`, { method: 'PUT' });
			const text = await res.text();

			if (!$packageStatStore.views[id]) $packageStatStore.views[id] = 0;
			if (text == '0') $packageStatStore.views[id]++;
		} catch (err) {
			console.error(err);
		}
	});
</script>

<svelte:head>
	<title>{packageNameToReadableFormat(id ?? 'no-name')} - KJSPKG Lookup</title>
</svelte:head>

{#if state == 'loading'}
	<div class="placeholder m-2 mx-auto w-32 animate-pulse" />
{:else if state == 'ready' && id}
	{@const statDownloads = $packageStatStore.downloads[id] ?? 0}
	{@const statViews = $packageStatStore.views[id] ?? 0}

	<h1 class="h2 text-center font-bold">
		<a
			href={`https://github.com/${locatorInfo[1]}/${locatorInfo[2]}`}
			class="anchor select-text no-underline"
			target="_blank"
		>
			{packageNameToReadableFormat(id ?? 'no-name') ?? 'This package'}
		</a>
	</h1>

	<div
		class="style-markdown blockquote flex w-full select-text flex-col gap-1 overflow-x-auto p-4"
		in:fly={{ y: 20 }}
	>
		<span class="select-text *:select-text">
			{@html markdownInline(thisPackage.description)}
		</span>
		<span class="text-sm opacity-50">
			<span>{statDownloads} {statDownloads == 1 ? $langKeyStore['list.download_singluar'] : $langKeyStore['list.download_plural']}</span> &bull;
			<span>{statViews} {statViews == 1 ? $langKeyStore['list.view_singular'] : $langKeyStore['list.view_plural']}</span>
		</span>
	</div>

	<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
		<a
			class="card flex p-4 hover:variant-soft-primary"
			href={base + `/s?q=@author:${locatorInfo[1]}`}
			in:fly={{ y: 20 }}
		>
			<img
				src={consts.AVATARS + locatorInfo[1]}
				alt="author's profile afirst child cssvatar"
				class="my-auto mr-4 aspect-square h-8 rounded-token"
			/>
			<dl>
				<dt class="text-sm opacity-50">{$langKeyStore['package.created_by']}</dt>
				<dd class="select-text font-bold">
					{thisPackage.author}
					{locatorInfo[1] != thisPackage.author ? `(${locatorInfo[1]})` : ''}
				</dd>
			</dl>
		</a>

		<div class="card p-4" in:fly={{ y: 20 }}>
			<dt class="text-sm opacity-50">{$langKeyStore['package.available_for']}</dt>
			<dd class="flex flex-wrap gap-1">
				{#each thisPackage.modloaders as t}
					<span class="variant-filled-primary badge select-text">{capitalizeFirstLetter(t)}</span>
				{/each}
				&bull;
				{#each thisPackage.versions as t}
					<span class="variant-filled-primary badge select-text">{`1.${+t + 10}`}</span>
				{/each}
			</dd>
		</div>

		<!-- <CodeBlock
			language="Install package"
			code={'kjspkg install ' + id}
			background="variant-soft w-full"
			buttonCopied="ok have fun"
		/> -->

		<div class="card hidden space-y-2 p-4 md:block" in:fly={{ y: 20 }}>
			<dt class="text-sm opacity-50">{$langKeyStore['package.manage_package']}</dt>
			<dd class="flex flex-col gap-1">
				<ManagePackage name={id ?? 'no-name'} link={issueLink} />
			</dd>
		</div>

		{#if thisPackage.dependencies.length > 0 || thisPackage.incompatibilities.length > 0}
			<div class="card h-fit space-y-2 p-4" in:fly|global={{ y: 20 }}>
				{#if thisPackage.dependencies.length > 0}
					<dt class="text-sm opacity-50">{$langKeyStore['package.depends_on']}</dt>
					<dd class="flex w-full gap-1">
						<dl class="list-dl w-full">
							{#each thisPackage.dependencies as t}
								<Dependency {t} />
							{/each}
						</dl>
					</dd>
				{/if}
				{#if thisPackage.incompatibilities.length > 0}
					<dt class="text-sm opacity-50">{$langKeyStore['package.incompatible_with']}</dt>
					<dd class="flex w-full gap-1">
						<dl class="list-dl w-full">
							{#each thisPackage.incompatibilities as t}
								<Dependency {t} />
							{/each}
						</dl>
					</dd>
				{/if}
			</div>
		{/if}

		{#if docs != ''}
			<section class="card h-fit space-y-4 p-4 lg:col-span-2" in:fly={{ y: 20 }}>
				<dt class="text-sm opacity-50">
					<a href={docLoc} class="underline" target="_blank">{$langKeyStore['package.readme_file']}</a>
				</dt>
				<dd class="style-markdown flex select-text flex-col items-start *:select-text">
					{@html docs}
				</dd>
			</section>
		{/if}
	</div>
{:else if state == 'fail'}
	<!-- <p>Something went wrong (this package doesn't seem to exist)</p> -->
	{(() => {
		toastStore.trigger({
			message: `Package Broken`,
			hideDismiss: true,
			timeout: 5000,
			background: 'variant-filled-error'
		});
		history.back();

		return undefined;
	})() || 'Please wait, redirecting...'}
{/if}
