<script lang="ts">
    import Row from "./Row.svelte";

    export let usdcPrice
    export let rows
    export let connection



</script>

<div>
                
    {#each rows as row}
        <Row usdcPrice={usdcPrice} {...row} connection={connection}/>
    {/each}

</div>