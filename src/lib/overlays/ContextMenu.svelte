<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { contextMenuStore } from './contextMenu';
</script>

{#if $contextMenuStore}
	<button
		class="bg-surface-backdrop-token absolute inset-0 z-[998] h-full w-full cursor-default"
		transition:fade
		on:contextmenu={(e) => {
			$contextMenuStore = undefined;
			e.preventDefault();

			setTimeout(() => {
				// Act like a right click at the mouse position, so that the context menu at that position opens.
				// Emulate the click, do not use this callback function - that position might not have the same context menu!
				let element = document.elementFromPoint(e.clientX, e.clientY);
				if (!element) return;
				element.dispatchEvent(e);
			}, 200);
		}}
		on:click={() => ($contextMenuStore = undefined)}
	/>
	<div
		class="card variant-glass-surface absolute z-[999] m-2 p-1"
		style="left: {$contextMenuStore.x}px; top: {$contextMenuStore.y}px;"
		class:invisible={$contextMenuStore.invisible}
		role="menu"
		tabindex="-1"
		id="GLOBAL-ctxm"
		on:keypress={() => ($contextMenuStore = undefined)}
		on:click={() => ($contextMenuStore = undefined)}
		transition:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="flex flex-col gap-1">
			{#each $contextMenuStore.items as item, i}
				{#if item.type == 'SEPARATOR'}
					{#if i > 0}
						<hr />
					{/if}
					<dd class="px-2 pt-1 text-sm opacity-50" class:hidden={!item.header}>{item.header}</dd>
				{:else if item.type == 'ITEM'}
					<button
						on:click={() => item.type == 'ITEM' && item.action()}
						class="flex items-center gap-2 overflow-hidden whitespace-nowrap p-2 pl-3 pr-12 rounded-container-token hover:variant-soft-primary"
					>
						{#if item.icon}
							<svelte:component this={item.icon} />
						{/if}
						<span>{item.label}</span>
					</button>
				{/if}
			{:else}
				<span class="p-2 text-sm opacity-50">no items</span>
			{/each}
		</div>
	</div>
{/if}
