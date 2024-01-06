<script lang="ts">
	import consts from '$lib/consts';
	import { IconBrandGithub } from '@tabler/icons-svelte';

	export let p: [string, string];
	export let c: number = 0;
	export let showAvatar = true;
	export let showGit = true;

	const locatorInfo = p[1].match(consts.LOCATOR_REGEX)!;
	const author = locatorInfo[1];
</script>

<div class="card flex p-4">
	{#if showAvatar}
		<img
			src={consts.AVATARS + author}
			alt="author's profile avatar"
			class="my-auto mr-4 aspect-square h-8 rounded-token"
		/>
	{/if}
	<dl class="grow">
		<dt class="font-bold select-text">{author}</dt>
		{#if c > 0}
			<dd class="text-sm opacity-50">
				owns {c}
				{c == 1 ? 'package' : 'packages'}
			</dd>
		{/if}
	</dl>
	{#if showGit}
		<a class="variant-filled-secondary btn-icon" href={`https://github.com/${author}`} target="_blank">
			<IconBrandGithub />
		</a>
	{/if}
</div>
