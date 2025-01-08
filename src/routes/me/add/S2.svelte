<script lang="ts">
	import consts from '$lib/consts';
	import ManagePackage from '$lib/project/ManagePackage.svelte';
	import { langKeyStore } from '$lib/stores';
	import { packageNameToReadableFormat } from '$lib/utils';
	import { Step } from '@skeletonlabs/skeleton';
	import BadgeCheckbox from './BadgeCheckbox.svelte';
	import Dependencies from './Dependencies.svelte';

	export let id: string;
	export let author: string | null;
	export let description: string;
	export let versions: number[] = [];
	export let modloaders: string[] = [];
	export let dependencies: string[] = [];
	export let incompatibilities: string[] = [];
	export let repoAuthor = '';
</script>

<Step locked={!description || modloaders.length < 1 || versions.length < 1}>
	<svelte:fragment slot="header">{$langKeyStore['new.2.header']}</svelte:fragment>

	<h1 class="anchor h2 text-center font-bold no-underline">
		{packageNameToReadableFormat(id ?? 'no-name')}
	</h1>

	<div class="style-markdown blockquote flex w-full select-text flex-col gap-1 overflow-x-auto p-4">
		<span class="select-text *:select-text">
			<input
				type="text"
				placeholder="Description"
				bind:value={description}
				class="inp {!description && '!ring-1 !ring-error-500'}"
			/>
		</span>
		<span class="text-sm opacity-50">
			<span>0 {$langKeyStore['list.download_plural']}</span> &bull;
			<span>0 {$langKeyStore['list.view_plural']}</span>
		</span>
	</div>

	<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
		<div class="card flex p-4">
			<img
				src={consts.AVATARS + repoAuthor}
				alt="author's profile avatar"
				class="my-auto mr-4 aspect-square h-8 rounded-token"
			/>
			<dl>
				<dt class="text-sm opacity-50">{$langKeyStore['package.created_by']}</dt>
				<dd class="select-text font-bold">
					<input
						type="text"
						placeholder={repoAuthor}
						bind:value={author}
						on:change={() => author === repoAuthor && (author = '')}
						class="inp placeholder:font-normal"
					/>
				</dd>
			</dl>
		</div>

		<div class="card p-4 {(modloaders.length < 1 || versions.length < 1) && '!ring-error-500'}">
			<dt class="text-sm opacity-50">{$langKeyStore['package.available_for']}</dt>
			<dd class="flex flex-wrap gap-1">
				<BadgeCheckbox bind:array={modloaders} badge="fabric" display="Fabric" />
				<BadgeCheckbox bind:array={modloaders} badge="forge" display="Forge" />
				&bull;
				{#each [2, 6, 8, 9, 10, 11] as t}
					<BadgeCheckbox bind:array={versions} badge={t} display={`1.${+t + 10}`} />
				{/each}
			</dd>
		</div>

		<div class="card hidden space-y-2 p-4 md:block">
			<dt class="text-sm opacity-50">{$langKeyStore['package.manage_package']}</dt>
			<dd class="flex flex-col gap-1">
				<ManagePackage name={id ?? 'no-name'} disabled />
			</dd>
		</div>

		<div class="card h-fit space-y-2 p-4">
			<dt class="text-sm opacity-50">{$langKeyStore['package.depends_on']}</dt>
			<dd class="flex w-full flex-col gap-1">
				<Dependencies bind:dependencies />
			</dd>

			<dt class="text-sm opacity-50">{$langKeyStore['package.incompatible_with']}</dt>
			<dd class="flex w-full flex-col gap-1">
				<Dependencies bind:dependencies={incompatibilities} />
			</dd>
		</div>
	</div>
</Step>
