<script lang="ts">
	export let size = 24;
</script>

<svg
	{...$$restProps}
	width={size}
	height={size}
	class={`tabler-icon tabler-icon-${name} ${$$props.class ?? ''}`}
/>
