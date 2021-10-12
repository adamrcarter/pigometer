<script lang="ts">
    import { calculateSOLPerPig, calculateUSDPerPig } from "src/util/calculations";

    let solPerPig = 0
    let piggybankSOL = 0
    let usdPerPig

    export let lamports = 0
    export let usdtPrice = 0

    $: solPerPig = Math.round(calculateSOLPerPig(lamports) * 100000) / 100000
    $: usdPerPig = Math.round(calculateUSDPerPig(lamports, usdtPrice) * 100000) / 100000
    $: piggybankSOL = Math.round((lamports/1000000000) * 100) / 100
    
</script>

<li class="cont flex col center">
    <div class="flex row center lg">
        <div class="item item-lg">◎{piggybankSOL}</div>
        <div class="item item-sm"> @ ${usdtPrice}</div>
    </div>
    <div class="flex row center lg">
    <div class="item">◎{solPerPig} /pp</div>
    <div class="item">${usdPerPig} /pp</div>
    </div>
</li>

<style>

    .flex{
        display: flex;
    }

    .col{
        flex-direction: column;
    }

    .row{
        flex-direction: row;
    }

    .lg{
        width:30vw;
        min-width: 300px;
    }

    .center{
        justify-content: center;
        align-items: center;
    }

    .item{
        padding: 10px;
        padding-bottom: 5px;
        color:rgb(254, 237, 237);
        
    }
    .item-lg{
        font-size: 100px;
    }
    .cont{
        height: 90%;
    }
    @media (max-width: 640px) {
       .item-lg{
           font-size: 50px;
       }
       
       
    }




</style>