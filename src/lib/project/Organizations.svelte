<script lang="ts">
	import { base } from "$app/paths";
	import { langKeyStore } from "$lib/stores";

	export let orgs : any[];
</script>

<div class="card flex flex-col items-start gap-y-2 p-4">
	<dt class="text-sm opacity-50">{$langKeyStore['author.organizations']}</dt>
		{#each orgs as org}
			<a class="card flex p-4 min-w-max w-full hover:variant-soft-primary" href="{base}/s/?q=@author:{org.login}">
				<img
					src={org.avatar_url}
					alt="organization's profile avatar"
					class="my-auto mr-4 aspect-square h-8 rounded-lg"
				/>
				<dl class="grow">
					<dt class="font-bold select-text">{org.login}</dt>
					<dd class="text-sm opacity-50">
						{$langKeyStore['author.owns']} {org.pkg_count}
						{$langKeyStore[org.pkg_count == 1 ? 'author.package_singular' : 'author.package_plural']}
					</dd>
				</dl>
			</a>
		{/each}
</div>