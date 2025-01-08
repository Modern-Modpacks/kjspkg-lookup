<script lang="ts">
	import consts from '$lib/consts';
	import { langKeyStore } from '$lib/stores';
	import { getToastStore, Step } from '@skeletonlabs/skeleton';
	import { IconUpload } from '@tabler/icons-svelte';
	import type { DragEventHandler } from 'svelte/elements';
	import RecursiveTree from './RecursiveTree.svelte';
	import { fade, slide } from 'svelte/transition';

	const defaultFiles = () =>
		Object.fromEntries(consts.ALLOWED_DIRS.map((d) => [d, {} as FileTree]));
	type FileTree = { [key: string]: ArrayBuffer | FileTree };
	export let files = defaultFiles() as FileTree;

	let autopopulated = false;
	let selectedFile: string | undefined = undefined;
	$: file = selectedFile
		? // @ts-expect-error bruh
			(selectedFile.split('/').reduce((acc, part) => acc?.[part], files) as ArrayBuffer)
		: undefined;
	$: for (const dir of consts.ALLOWED_DIRS) if (!(dir in files)) files[dir] = {};

	const toastStore = getToastStore();
	const err = (msg: string) =>
		toastStore.trigger({
			message: $langKeyStore[msg],
			hideDismiss: true,
			timeout: 5000,
			background: 'variant-filled-error'
		});

	const droppable = (node: HTMLElement) => {
		node.addEventListener(
			'dragover',
			(e) => (e.preventDefault(), node.classList.add('!ring-success-500'))
		);
		node.addEventListener('dragleave', () => node.classList.remove('!ring-success-500'));
		node.addEventListener(
			'drop',
			(e) => (e.preventDefault(), node.classList.remove('!ring-success-500'))
		);
	};
	const drop: DragEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault();

		if (!e.dataTransfer) return;
		const handles = [...e.dataTransfer.items].filter((i) => i.kind === 'file');
		if (handles.length !== 1) return err('new.3.err_multiple');
		if (!handles[0].getAsFileSystemHandle) return err('new.3.err_no_fs');

		const file = await handles[0].getAsFileSystemHandle();
		if (!file) return err('new.3.err_no_file');
		if (file.kind !== 'directory' || file.name !== 'kubejs') return err('new.3.err_not_kjs');
		files = defaultFiles();
		autopopulated = true;

		async function addFilesFromDirectory(
			directoryHandle: FileSystemDirectoryHandle,
			parent: FileTree,
			path: string
		) {
			for await (const entry of directoryHandle.values()) {
				if (entry.kind === 'file') {
					const fs = await entry.getFile();
					parent[entry.name.replace(/^kubejs\//, '')] = await fs.arrayBuffer();
				} else if (entry.kind === 'directory') {
					if (entry.name === '.kjspkg') continue;
					if (!parent[entry.name]) parent[entry.name] = {};
					await addFilesFromDirectory(
						entry,
						parent[entry.name] as FileTree,
						`${path}/${entry.name}`
					);
				}
			}
		}
		await addFilesFromDirectory(file as FileSystemDirectoryHandle, files, file.name);

		for (const path of Object.keys(files)) {
			if (consts.ALLOWED_DIRS.some((d) => path.startsWith(d))) continue;
			delete files[path];
		}
		files = files;
	};
	const dropFile: DragEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault();

		if (!selectedFile) return;
		if (!e.dataTransfer) return;
		const handles = [...e.dataTransfer.items].filter((i) => i.kind === 'file');
		if (handles.length !== 1) return err('new.3.err_multiple');

		const file = await handles[0].getAsFile();
		if (!file) return err('new.3.err_no_file');

		const arrayBuffer = await file.arrayBuffer();
		// @ts-expect-error bruh
		selectedFile.split('/').reduce((acc, key, index, arr) => {
			if (index === arr.length - 1) acc[key] = arrayBuffer;
			else if (!acc[key]) acc[key] = {};
			return acc[key];
		}, files);
		files = files;
	};
</script>

<Step locked={Object.keys(files).length < 1} regionContent="!space-y-0">
	<svelte:fragment slot="header">{$langKeyStore['new.3.header']}</svelte:fragment>

	{#if !autopopulated}
		<div
			class="card mb-4 flex flex-col items-center gap-2 p-4"
			on:drop={drop}
			use:droppable
			role="form"
			out:slide
		>
			<IconUpload />
			<p>{$langKeyStore['new.3.drop']}</p>
		</div>
	{/if}

	<div class="grid grid-cols-[16rem_1fr] gap-2">
		<div><RecursiveTree bind:files bind:selectedFile filesDelete={() => {}} /></div>
		{#if file}
			{#key file}
				<div
					in:fade|global={{ duration: 20 }}
					class="flex flex-col items-center justify-center gap-2"
				>
					<div
						class="card flex h-fit flex-col items-center gap-2 p-4"
						on:drop={dropFile}
						use:droppable
						role="form"
					>
						<p class="select-text">{selectedFile} ({file.byteLength}b)</p>
						<p class="text-sm opacity-50">{$langKeyStore['new.3.drop_single']}</p>
					</div>
					<p class="text-center text-xs opacity-50">{$langKeyStore['new.3.delete']}</p>
				</div>
			{/key}
		{:else}
			<div class="flex flex-col items-center justify-center gap-2">
				<p class="text-center text-lg opacity-50">
					{autopopulated ? $langKeyStore['new.3.populated'] : $langKeyStore['new.3.populate']}
				</p>
			</div>
		{/if}
	</div>
</Step>
