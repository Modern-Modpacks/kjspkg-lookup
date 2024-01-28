<script lang="ts">
	import { base } from "$app/paths";
	import { ghApiKeyStore } from "$lib/stores";
	import { filterPkgsByAuthor, getGhInfo } from "$lib/utils";

	export let author : string;
</script>

{#await getGhInfo(`users/${author}/orgs`, $ghApiKeyStore) then orgs}
	<!-- {@debug orgs} -->
	{#if orgs.length>0}
		<div class="card flex flex-col items-start gap-y-2 p-4">
			<dt class="text-sm opacity-50">Organizations</dt>
				{#each orgs as org}
					{@const c = filterPkgsByAuthor(org.login).length}

					{#if c>0}
						<a class="card flex p-4 min-w-max w-full hover:variant-soft-primary" href="{base}/s/?q=@author:{org.login}">
							<img
								src={org.avatar_url}
								alt="organization's profile avatar"
								class="my-auto mr-4 aspect-square h-8 rounded-lg"
							/>
							<dl class="grow">
								<dt class="font-bold select-text">{org.login}</dt>
								<dd class="text-sm opacity-50">
									owns {c}
									{c == 1 ? 'package' : 'packages'}
								</dd>
							</dl>
						</a>
					{/if}
				{/each}
		</div>
	{/if}
{/await}