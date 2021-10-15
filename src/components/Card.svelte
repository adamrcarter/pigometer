<script lang="ts">
    export let value = 0;
    export let title = "";

</script>

<div class="card">
    <div class="title">
        {title}
    </div>
    <div class="item">
        {value}
    </div>

</div>

<style>

    .card{
        padding:10px;
        border: 1px solid #fff;
        border-radius: 10px;
        background-color: rgb(238, 238, 238);
        width: 500px;
        margin: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 300px;
        -webkit-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        -moz-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);

    }

</style>