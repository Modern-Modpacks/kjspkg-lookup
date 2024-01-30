<script lang="ts">
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { ghApiLoginStore } from "$lib/stores";

    // TODO: add a page if login is not found
    ghApiLoginStore.subscribe(login => {
        goto(`${base}/s/?q=@author:${login}`)
    })
</script>