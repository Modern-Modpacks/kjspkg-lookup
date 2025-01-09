<script lang="ts">
	import { popup } from '@skeletonlabs/skeleton';
	import { IconFile, IconFolder, IconPlus, IconTrash } from '@tabler/icons-svelte';

	type FileTree = { [key: string]: ArrayBuffer | FileTree };
	export let files = {} as FileTree;
	export let p = '';
	export let selectedFile: string | undefined = undefined;
	export let filesDelete: () => void;
</script>

{#each Object.entries(files) as [path, file]}
	{@const filePath = `${p}${path}`}
	{@const popupId = 'popup-explorer-' + p + '-' + path}
	{#if file instanceof ArrayBuffer}
		<button
			class="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center rounded text-left"
			class:variant-filled-primary={selectedFile === filePath}
			class:hover:variant-soft-primary={selectedFile !== filePath}
			on:click={() => (selectedFile = selectedFile === filePath ? undefined : filePath)}
		>
			<IconFile class="mr-1 size-4" />
			<p class="overflow-hidden">{path}</p>
			<button
				class="mr-1 rounded hover:variant-filled-error"
				on:click={() => {
					selectedFile = undefined;
					delete files[path];
					if (Object.keys(files).length < 1) filesDelete();
					files = files;
				}}
			>
				<IconTrash class="size-4" />
			</button>
		</button>
	{:else}
		<div>
			<div class="grid grid-cols-[auto_1fr_auto] items-center">
				<IconFolder class="mr-1 size-4" />
				<p class="overflow-hidden">{path}</p>

				<button
					class="mr-1 rounded hover:variant-filled-primary"
					use:popup={{ event: 'click', target: popupId, placement: 'right' }}
				>
					<IconPlus class="size-4" />
				</button>
				<input
					data-popup={popupId}
					class="card z-10 p-4"
					type="text"
					placeholder="path/to/file.js"
					on:input={(e) => {
						const value = e.currentTarget.value;
						e.currentTarget.value = value.replace(/\\/g, '/');
					}}
					on:keydown={(e) => {
						if (e.key !== 'Enter') return;
						const value = e.currentTarget.value.trim();
						if (!value) return;

						let target = files;
						const parts = `${path}/${value}`.split('/');
						const fileName = parts.pop();

						for (const part of parts) {
							if (!target[part]) target[part] = {};
							// @ts-expect-error bruh
							target = target[part];
						}

						// @ts-expect-error I so want svelte 5 so that I can properly use ts >:(
						target[fileName] = new ArrayBuffer(0);
						files = files;

						selectedFile = `${p}${path}/${value}`;
						e.currentTarget.value = '';
					}}
				/>
			</div>
			<div class="ml-1 border-l-2 border-l-surface-600 pl-2">
				<svelte:self
					files={file}
					p={filePath + '/'}
					bind:selectedFile
					filesDelete={() => {
						delete files[path];
						if (Object.keys(files).length < 1) filesDelete();
						files = files;
					}}
				/>
			</div>
		</div>
	{/if}
{/each}
