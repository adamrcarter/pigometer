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

<div class="cont flex col center">
    <div class="card">
        <div class="pb-total">Total in piggybank wallet:</div>

        <div class="flex row center lg">
            <div class="item item-lg">◎{piggybankSOL}</div>
            <div class="item item-sm"> @ ${usdtPrice}</div>
        </div>
        <div class="flex row center lg">
        <div class="item">◎{solPerPig} /pp</div>
        <div class="item">${usdPerPig} /pp</div>
    </div>
    </div>
</div>

<style>

    .flex{
        display: flex;
    }

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
        color:rgb(37, 37, 37);
        
    }
    .item-lg{
        font-size: 100px;
    }
    .cont{
        height: 80%;
        z-index: 2;
		position: relative;
    }
    @media (max-width: 640px) {
       .item-lg{
           font-size: 50px;
       }
       .card{
            width: 90vw;
            height: 200px
       }
       
       
    }




</style>