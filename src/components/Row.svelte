<script>
import TableValue from "./TableValue.svelte";


    export let name;
    export let num_cols;
    export let column_values;
    export let pubkey;
    export let connection;
    export let lastTX;

</script>

<div class="row">

    <div style="width: 25%;">{name}</div>
    {#each column_values as val }
            <TableValue value={val} isLoading={false}/>
    {/each}

</div>

<style>

    .row{
        flex-direction: row;
        height: 50px;
        padding-top: 30px;
        border-bottom: 1px #f0eded solid;
        display: flex;

    }

</style>