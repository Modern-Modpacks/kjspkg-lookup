<script lang="ts">
	import { ghApiKeyStore, ghApiLoginStore, langKeyStore, packageListStore } from '$lib/stores';
	import { getGhInfo, packageNameToReadableFormat } from '$lib/utils';
	import { Step } from '@skeletonlabs/skeleton';
	import { vsprintf } from 'sprintf-js';

	export let id: string;
	export let repo: { parent: string; name: string };

	let rExists = true;
	let rExistsTimer: ReturnType<typeof setTimeout>;
	$: {
		rExists = true;
		clearTimeout(rExistsTimer);
		const timer = setTimeout(async () => {
			const exists = await getGhInfo(`repos/${repo.parent}/${repo.name}`, $ghApiKeyStore).then(
				(r) => !r._err
			);
			if (rExistsTimer !== timer) return;
			rExists = !repo.parent || !repo.name || exists;
		}, 10);
		rExistsTimer = timer;
	}

	$: locked =
		!id ||
		id.length < 3 ||
		id.length > 50 ||
		!!id.match(/-$/g) ||
		!$packageListStore ||
		id in $packageListStore ||
		!repo.parent ||
		!repo.name ||
		repo.name === 'kjspkg' ||
		rExists;
</script>

<Step {locked}>
	<svelte:fragment slot="header">{$langKeyStore['new.1.header']}</svelte:fragment>

	<div class="grid grid-cols-3 items-center gap-2">
		ID
		<input
			type="text"
			placeholder="ID"
			value={id}
			on:input={({ currentTarget: ct }) => {
				const v = ct.value;
				ct.value = v
					.replace(/\s+/g, '-')
					.replace(/[^a-zA-Z0-9\-]/g, '')
					.replace(/--+/g, '-')
					.replace(/^-/, '')
					.toLowerCase();
				id = ct.value;
				repo.name = id ? 'kubejs-' + id : '';
				ct.focus(); // fuck you firefox. fuck you. fuck. you.
			}}
			class="inp col-span-2"
		/>
		<div />
		<p class="col-span-2 text-sm opacity-50">
			{#if id.length < 3}
				{$langKeyStore['new.1.err_too_short']}
			{:else if $packageListStore && id in $packageListStore}
				{$langKeyStore['new.1.err_already_exists']}
			{:else}
				{vsprintf($langKeyStore['new.1.display_name'], [packageNameToReadableFormat(id)])}
			{/if}
		</p>
		<div class="col-span-3" />

		Repository
		{#await getGhInfo('users/' + $ghApiLoginStore + '/orgs', $ghApiKeyStore)}
			<div>...</div>
		{:then orgs}
			<select class="inp col-span-1" bind:value={repo.parent}>
				<option value={$ghApiLoginStore}>{$ghApiLoginStore}</option>
				{#each orgs as org}
					<option value={org.login}>{org.login}</option>
				{/each}
			</select>
		{/await}
		<input
			type="text"
			placeholder="Name"
			value={repo.name}
			on:input={({ currentTarget: ct }) => {
				const v = ct.value;
				ct.value = v.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_\.]/g, '');
				repo.name = ct.value;
				ct.focus(); // fuck you firefox. fuck you. fuck. you.
			}}
			class="inp"
		/>
		<div />
		<p class="col-span-2 text-sm opacity-50">
			{#if !repo.name}
				{$langKeyStore['new.1.err_repo_nameless']}
			{:else if rExists}
				{$langKeyStore['new.1.err_repo_exists']}
			{:else if !['kube', 'js'].some((x) => repo.name.includes(x))}
				{$langKeyStore['new.1.err_repo_name_consideration']}
			{:else}
				{$langKeyStore['new.1.repo_name']}
			{/if}
		</p>
		<div class="col-span-3" />
	</div>
</Step>
