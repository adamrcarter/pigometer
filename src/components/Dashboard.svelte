<script lang="ts">

    import { calculateAverageSOLPerDay, calculateAverageSOLPerPig, calculateSOLPerPig, calculateUSDPerPig, LAMPORT_SOL_FACTOR } from "src/util/calculations";

    let solPerPig = 0
    let piggybankSOL = 0
    let usdPerPig
    let averageSOLperDay = 0
    let averageUSDperDay = 0;
    let volume = 0;

    export let lamports = 0
    export let usdtPrice = 0
    export let floor = 0
    export let numListedAlpha = 0;

    $: solPerPig = Math.round(calculateSOLPerPig(lamports) * 100000) / 100000
    $: usdPerPig = Math.round(calculateUSDPerPig(lamports, usdtPrice) * 100000) / 100000
    $: piggybankSOL = Math.round((lamports/LAMPORT_SOL_FACTOR) * 100) / 100
    $: averageSOLperDay = Math.round(calculateAverageSOLPerPig(lamports, new Date().getTime()/1000) * 1000) /1000
    $: averageUSDperDay = averageSOLperDay * usdtPrice
    $: volume = Math.round((((lamports  / .02 ) / .3) / LAMPORT_SOL_FACTOR))
    $: maleFloor = Math.round(( floor / LAMPORT_SOL_FACTOR) * 100) / 100

</script>
<div class="dashboard-con">
<div class="flex mid even">
<div class="card sm">
    <div class="pb-total">Alpha.art total volume:</div>
    <div class="flex row center lg">
    <div class="item item-md">◎{volume}</div>
    <div class="item">${Math.round(volume * usdtPrice )}</div>
</div>
</div>
<div class="card sm">
    <div class="pb-total">Male Pig floor:</div>
    <div class="flex row center lg">
    <div class="item item-md">◎{maleFloor}</div>
    <div class="item">${Math.round((maleFloor * usdtPrice)*100)/100}</div>
    </div>
</div>
<div class="card sm">
    <div class="pb-total">Average daily per pig:</div>
    <div class="flex row center lg">
    <div class="item item-md">◎{averageSOLperDay}</div>
    <div class="item">${Math.round(averageUSDperDay *100)/ 100}</div>
    </div>
</div>
<div class="card sm">
    <div class="pb-total">Male pigs listed on Alpha.art:</div>
    <div class="flex row center lg">
    <div class="item item-md">{numListedAlpha}</div>
    <!-- <div class="item">${averageUSDperDay}</div> -->
    </div>
</div>
<div class="card sm centerself">
    <div class="pb-total">Total payout per pig:</div>
    <div class="flex row center lg">
    <div class="item item-md">◎{solPerPig}</div>
    <div class="item">${Math.round(usdPerPig *100)/ 100}</div>
    </div>
</div>



<!-- </div> -->
<!-- <div class="cont flex col center"> -->
    <div class="card">
        <div class="pb-total">Total in DAO wallet:</div>

        <div class="flex row center lg">
            <div class="item item-lg">◎{piggybankSOL}</div>
            <div class="item item-sm">${Math.round((piggybankSOL *usdtPrice) *100) / 100}</div>
        </div>
        <!-- <div class="flex row center lg">
        <div class="item">◎{solPerPig} /pp</div>
        <div class="item">${usdPerPig} /pp</div>
        <div class="item">◎{averageSOLperDay} /pp</div> -->

    </div>
    <!-- </div> -->

    <div class="card sm">
        <div class="pb-total">SOL/USD</div>
        <!-- <div class="flex row center lg"> -->
        <div class="item item-md">${usdtPrice}</div>
        <!-- <div class="item">${averageUSDperDay}</div> -->
        <!-- </div> -->
    </div>
    

</div>
</div>

<style>

    /* .centerself{
        justify-self: center;
    } */

    .dashboard-con{
        max-width:1600px;
        height: calc(100vh - 80px);
        overflow-y: scroll;
        padding-top: 30px;
        -ms-overflow-style: none;
        scrollbar-width: none;
        margin:auto;
    }

    .dashboard-con::-webkit-scrollbar{
        display: none;
    }

    .flex{
        display: flex;
        flex-wrap: wrap;
    }

    /* .mid{
        width:70%;
        margin: auto;
    } */

    .center{
        justify-content: center;
        align-items: center;
    }

    .even{
        justify-content: space-evenly;
        align-items: center;
        padding-bottom: 60px;
    }


    .card{
        padding:10px;
        border: 1px solid #fff;
        border-radius: 10px;
        background-color: rgb(238, 238, 238);
        width: 500px;
        /* margin: auto; */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 300px;
        -webkit-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        -moz-box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        box-shadow: 10px 10px 44px -5px rgba(0,0,0,0.75);
        margin-top: 38px;
        z-index: 100;

    }


    .sm{
        width: 300px;
        height: 100px;

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

    .paddmd{
        padding-top: 50px;
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

    .item-md{
        font-size: 30px;
    }
    .cont{
        height: 80%;
        z-index: 100;
		position: relative;
    }
    @media (max-width: 640px) {
       .item-lg{
           font-size: 50px;
       }
       .card{
            width: 90vw;
            height: 200px;
            margin-top: 10px;

       }



       .sm{
           width: 90vw;
           height: 100px;
       }
       
       
    }




</style>