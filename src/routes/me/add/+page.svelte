<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import consts from '$lib/consts';
	import { ghApiKeyStore, ghApiLoginStore, langKeyStore, packageListStore } from '$lib/stores';
	import { getGhInfo, initPackageList, postGhInfo } from '$lib/utils';
	import { ProgressRadial, Stepper } from '@skeletonlabs/skeleton';
	import { IconAlertTriangle, IconCheck } from '@tabler/icons-svelte';
	import { vsprintf } from 'sprintf-js';
	import { onMount } from 'svelte';
	import S1 from './S1.svelte';
	import S2 from './S2.svelte';
	import S3 from './S3.svelte';
	import S4 from './S4.svelte';
	import S5 from './S5.svelte';
	import dedent from 'dedent';

	ghApiLoginStore.subscribe((login) => !login && goto(`${base}/me`));

	type FileTree = { [key: string]: ArrayBuffer | FileTree };
	const defaultFiles = () =>
		Object.fromEntries(consts.ALLOWED_DIRS.map((d) => [d, {} as FileTree]));

	let id = '';
	let files = defaultFiles() as FileTree;
	let manifest = {
		author: '',
		description: '',
		versions: [] as number[],
		modloaders: [] as string[],
		dependencies: [] as string[],
		incompatibilities: [] as string[]
	};
	let repo = { parent: $ghApiLoginStore ?? '', name: '' };

	onMount(async () => await initPackageList());

	let processing = false;
	let processingDone = false;
	const ensureOk = (resp: any) => {
		if (!resp._err) return resp;
		console.error('An error occurred (see trace)');
		throw new Error('API response error');
	};
	// https://siddharthav.medium.com/push-multiple-files-under-a-single-commit-through-github-api-f1a5b0b283ae
	const complete = async () => {
		processing = true;
		const isOrga = repo.parent !== $ghApiLoginStore;
		const repoUrl = `repos/${repo.parent}/${repo.name}`;

		// prettier-ignore
		ensureOk(await postGhInfo(
			isOrga ? `orgs/${repo.parent}/repos` : `user/repos`,
			{ name: repo.name, description: '[KJSPKG] ' + manifest.description, has_wiki: false },
			$ghApiKeyStore
		));

		// prettier-ignore
		ensureOk(await postGhInfo(
			`${repoUrl}/contents/.kjspkg`,
			{ message: '[KJSPKG] Initial commit', content: btoa(JSON.stringify(manifest, null, 4)) },
			$ghApiKeyStore, 'PUT'
		));

		const blobs: Record<string, string> = {};
		const iterateOverFiles = async (fileTree: FileTree, path = '') => {
			for (const [k, v] of Object.entries(fileTree)) {
				if (v instanceof ArrayBuffer) {
					// https://stackoverflow.com/a/26603875
					const content = btoa(String.fromCharCode(...new Uint8Array(v)));
					// prettier-ignore
					blobs[path + k] = ensureOk(await postGhInfo(
						`${repoUrl}/git/blobs`,
						{ content, encoding: 'base64' },
						$ghApiKeyStore
					)).sha;
				} else await iterateOverFiles(v, path + k + '/');
			}
		};
		await iterateOverFiles(files);

		const base_tree = ensureOk(await getGhInfo(`${repoUrl}/git/trees/main`, $ghApiKeyStore)).sha;
		const tree: { path: string; mode: string; type: string; sha: string }[] = [];
		for (const [k, v] of Object.entries(blobs))
			tree.push({ path: k, mode: '100644', type: 'blob', sha: v });

		// prettier-ignore
		const commitSha = ensureOk(await postGhInfo(`${repoUrl}/git/trees`, { tree, base_tree }, $ghApiKeyStore)).sha;
		// prettier-ignore
		const parentSha = ensureOk(await getGhInfo(`${repoUrl}/git/refs/heads/main`, $ghApiKeyStore)).object.sha;

		// prettier-ignore
		const commitedSha = ensureOk(await postGhInfo(
			`${repoUrl}/git/commits`,
			{ message: '[KJSPKG] Initial commit', tree: commitSha, parents: [parentSha] },
			$ghApiKeyStore
		));

		// prettier-ignore
		ensureOk(await postGhInfo(
			`${repoUrl}/git/refs/heads/main`,
			{ sha: commitedSha.sha },
			$ghApiKeyStore, 'PATCH'
		));

		/// adding to package list ///

		const kjspkgExists = await getGhInfo(`repos/${$ghApiLoginStore}/kjspkg`, $ghApiKeyStore).then(
			(r) => !r._err
		);

		if (!kjspkgExists) {
			ensureOk(await postGhInfo(`repos/Modern-Modpacks/kjspkg/forks`, {}, $ghApiKeyStore));
			await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds, I cba to properly wait for fork creation
		} else {
			// prettier-ignore
			ensureOk(await postGhInfo(
				`repos/${$ghApiLoginStore}/kjspkg/merge-upstream`,
				{ branch: 'main' },
				$ghApiKeyStore
			));
		}

		const packageList = await getGhInfo(
			`repos/${$ghApiLoginStore}/kjspkg/contents/pkgs.json`,
			$ghApiKeyStore
		);
		// gcat asked for this. what the fuck man
		const pl = atob(packageList.content).split('\n');
		pl.pop();
		pl.pop();
		pl[pl.length - 1] += ',';
		pl.push(`    "${id}": "${repo.parent}/${repo.name}"`); // id, author and repo cant contain ", so we should be good
		pl.push('}');
		const plout = pl.join('\n');

		// prettier-ignore
		/* i cant get this to work lol ensureOk(await postGhInfo(
			`repos/${$ghApiLoginStore}/kjspkg/git/refs`,
			{ ref: `refs/heads/pkg/${id}`, sha: packageList.sha },
			$ghApiKeyStore
		)); */

		// prettier-ignore
		ensureOk(await postGhInfo(
			`repos/${$ghApiLoginStore}/kjspkg/contents/pkgs.json`,
			{ message: `[KJSPKG] Add package ${id}`, content: btoa(plout), sha: packageList.sha }, //, branch: `pkg/${id}` },
			$ghApiKeyStore, 'PUT'
		));

		// prettier-ignore
		ensureOk(await postGhInfo(
			`repos/Modern-Modpacks/kjspkg/pulls`,
			{ title: `[KJSPKG] Add package ${id}`, body: dedent`
				This pull request was automatically generated by KJSPKG Lookup.
				It was created to add the package "${id}" to the package list.

				> ${manifest.description}
				
				**Author**: ${manifest.author}
				**Versions**: ${manifest.versions.map((v) => `1.${v+10}`).join(', ')}
				**Modloaders**: ${manifest.modloaders.join(', ')}
				**Dependencies**: ${manifest.dependencies.join(', ')}
				**Incompatibilities**: ${manifest.incompatibilities.join(', ')}
				**Repository**: https://github.com/${repo.parent}/${repo.name}
			`, head: `${$ghApiLoginStore}:main`, base: 'main' }, // branch: `pkg/${id}`, base: 'main' },
			$ghApiKeyStore, 'POST'
		));

		processingDone = true;
	};
</script>

<svelte:head>
	<title>New package - KJSPKG Lookup</title>
</svelte:head>

{#if !window.showDirectoryPicker}
	<aside class="card variant-ghost-error mb-4 flex items-center gap-2 p-4">
		<IconAlertTriangle class="size-8" />
		<p>{$langKeyStore['new.compat.browser_skill_issues']}</p>
	</aside>
{/if}

{#if !processing}
	<Stepper
		buttonBackLabel={$langKeyStore['new.button.back']}
		buttonNextLabel={$langKeyStore['new.button.next']}
		buttonCompleteLabel={$langKeyStore['new.button.complete']}
		stepTerm={$langKeyStore['new.button.step']}
		on:complete={async () => {
			try {
				await complete();
			} catch (e) {
				if (e !== true) console.error(e);
				alert(
					'An error occurred. Partial changes may have been made, ' +
						'manual intervention may be required.'
				);
				processing = false;
			}
		}}
	>
		<S1 bind:id bind:repo />
		<S2
			bind:id
			bind:author={manifest.author}
			bind:description={manifest.description}
			bind:versions={manifest.versions}
			bind:modloaders={manifest.modloaders}
			bind:dependencies={manifest.dependencies}
			bind:incompatibilities={manifest.incompatibilities}
			repoAuthor={repo.parent}
		/>
		<S3 bind:files />
		<S4 bind:files />
		<S5 bind:files author={manifest.author || repo.parent} />
	</Stepper>
{:else if processingDone}
	<IconCheck class="mx-auto size-12" />
	<p class="text-center">
		{@html vsprintf($langKeyStore['new.processing.done'], [
			`https://github.com/${repo.parent}/${repo.name}`
		])}
	</p>
{:else}
	<ProgressRadial class="mx-auto" width="w-12" />
	<p class="text-center text-sm opacity-50">{$langKeyStore['new.processing']}</p>
{/if}
