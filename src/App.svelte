<script lang="ts">
import Dashboard from "./components/Dashboard.svelte";
import Poller from "./components/Poller.svelte";

	let name: string = 'world';
</script>

<main> 
	<img id="img-1" src="pig1.png">
	<img id="img-2" src="pig2.png">
	<img id="img-3" src="pig3.png">
	<img id="img-4" src="pig4.png">

	<h1 class="title">PIG<span id="pignose">o</span>METER</h1>

<Poller let:lamports={lamports} let:usdtPrice={usdtPrice}>
	<Dashboard {lamports} {usdtPrice}/>
</Poller>
</main>

<style lang="scss">
	main {

		text-align: center;
		// max-width: 240px;
		margin: 0 auto;
		height: 100vh;

		background-color: #FF6995;

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
			padding: 10px;
		}

		// @media (min-width: 640px) {
		// 	max-width: none;
		// }
	}
	img{
		position: absolute;
	}
	#pignose{
		font-size: 1em;
	}

	img{
		bottom:0;
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
		}

		#img-3{
			right: -80px;
		}

	}


</style>
