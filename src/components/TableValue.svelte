<script>
    export let value = []
    export let isLoading = true

</script>

<div class="row_val">
    {#if value !== null}
        {value}
    {/if}
</div>

<style>
    .row_val{
        width: 25%;
    }
</style>