<script lang="ts">
import Dashboard from "./components/Dashboard.svelte";
import Poller from "./components/Poller.svelte";

	let name: string = 'world';
</script>

<main>
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
			color: #ff3e00;
			text-transform: uppercase;
			font-size: 4em;
			font-weight: 100;
		}

		// @media (min-width: 640px) {
		// 	max-width: none;
		// }
	}
</style>
