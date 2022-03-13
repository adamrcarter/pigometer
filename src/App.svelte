<script lang="ts">
import { ParsedTransactionWithMeta } from "@solana/web3.js";

import { createConnection, getTransactionsSigToDate } from "./api/api";

import Dashboard from "./components/Table.svelte";
import Poller from "./components/Poller.svelte";
import { ALPHA_PUBKEY, ALPHA_TAKEOVER_TIMESTAMP } from "./const";
import { delay } from "./util";

</script>

<main> 
	<img id="img-1" src="pig1.png">
	<img id="img-2" src="pig3.png">
	<img id="img-3" src="pig2.png">
	<img id="img-4" src="pig4.png">

	<div class='title'>
		<h1>PIG<span id="pignose">o</span>METER</h1>
	</div>

<Poller let:numListedAlpha={numListedAlpha} let:lamports={lamports} let:usdtPrice={usdtPrice} let:floor={floor}>
	<Dashboard usdcPrice={usdtPrice}/>
</Poller>

<div class="footer">

		<img class="ape" src="ape1.png"/>
		<div class="col padd-4">
		<div class="description">Developed by Professor Mint</div>
		<!-- <div class="address">EmDpqnBybTACHK7JVSNcQgRAXvGj17Nqn4mGFTpkfqiN</div> -->
	</div>
</div>
</main>

<style lang="scss">
	main {

		#wallets{
			position: fixed;
			right: 40px;
			top: 180px;
			width: auto;
			height: 420px;
			z-index: 1000;
		}

		.pad-4{
			padding-left: 4px;
		}

		text-align: center;
		// max-width: 240px;
		margin: 0 auto;
		height: 100vh;

		background-color: #FF6995;
		.title{
			height:30px;
			display:flex;
			align-items: center;
			width:100%;
			justify-content: flex-end;
			height:50px;
			
			
		}
		h1 {
			color: rgb(255, 253, 252);
			text-transform: uppercase;
			font-size: 2em;
			font-weight: 800;
			margin-block-start: 0em;
			margin-block-end: 0em;
			margin-inline-start: 0px;
			margin-inline-end: 0px;
			text-align: right;
			padding-right: 10px;
		}

		// @media (min-width: 640px) {
		// 	max-width: none;
		// }
	}

	.footer{
		font-size: 10px;
		position: absolute;
		bottom: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		flex-direction: row;
		margin: auto;
		width: 100vw;
		color: rgb(61, 59, 59);

	}
	img{
		position: absolute;
	}
	.col{
		flex-direction: column;
	}
	#pignose{
		font-size: 1em;
	}

	img{
		bottom:0;
	}
	.ape{
		position: unset;
		width: 30px;
		border-radius: 50%;
		margin-right: 10px ;

	}

	.description{
		text-align: left;
	}

	.address{
		text-align: left;
	}

	#img-1{
			width: auto;
			height: 300px;
			left: -130px;
			z-index: 1;

		}
		#img-2{
			width: auto;
			height: 300px;
			left: -20px;
			z-index: 0;


		}
		#img-3{
			width: auto;
			height: 300px;
			right: -20px;
			z-index: 0;
			transform: scaleX(-1);

		}	
		#img-4{
			width: auto;
			height: 300px;
			right: -130px;
			z-index: 1;
			transform: scaleX(-1);

		}

	@media (max-width: 640px) {
		#img-2{
			left: -80px;
			display: none;
		}

		#img-1{
			display: none;
		}
		#img-4{
			display: none;
		}



		#img-3{
			right: -80px;
			display: none;
		}



	}
	@media (max-width: 1024px) {

	.footer{
           background-color: #fff;
		   padding: 10px;
		   border-radius: 5%;
		   z-index: 10;
		   bottom: 0;
       }
	   #img-2{
			display: none;
		}

		#img-1{
			display: none;
		}
		#img-4{
			display: none;
		}



		#img-3{
			display: none;
		}

	}

	@media (max-width: 1400px){
		#wallets{
			display: none;
		}
	}


</style>
