import axios from "axios";

export const poll = (apiFunc : Function, ms = 4000) =>{
    apiFunc()
    return setInterval(apiFunc, ms);

}

export const getPiggyBankLamports = async () =>{
    try{
        console.log('Fetching account details for piggybank')
        const accountDetails = await axios.get("https://api.solscan.io/account?address=DaoSrx3wBdRM8oATwYwfD8BTkHwBibVVv2SLR8LMDnLP")
        if(accountDetails.status === 200){
            console.log(accountDetails)
            const data : any = accountDetails.data 
            return data.data.lamports;
        }
        else{
             console.error(`Error account details fetching from solscan. Responseded with status ${accountDetails.status}`)
        }
    }
    catch(e){
        console.error(`Error account details fetching from solscan.\n${e.message}`)
    }
}

export const getUSDSOLPrice = async () =>{
    console.log('Fetching usdsol price')

    const solUSD : any= await axios.get("https://api.solscan.io/market?symbol=SOL");
    try{
        if(solUSD.status === 200){
            console.log(solUSD)
            return solUSD.data.data.priceUsdt;
        }
        else{
            console.error(`Error fetching usdt price  from solscan. Responseded with status ${solUSD.status}`)
    }
    }
    catch(e){
        console.error(`Error etching usdt price from solscan.\n${e.message}`)
    }
}

export const getFloorMale = async () =>{
    console.log('Fetching male floor price')

    const floorLamports : any = await axios.get("https://apis.alpha.art/api/v1/collection/piggy-sol-gang");
    try{
        if(floorLamports.status === 200){
            console.log(floorLamports)
            return floorLamports.data.floorPrice;
        }
        else{
            console.error(`Error fetching floor price from solscan. Responseded with status ${floorLamports.status}`)
    }
    }
    catch(e){
        console.error(`Error etching floor price price from solscan.\n${e.message}`)
    }

}

export const getNumListings = async () =>{
    const json = {collectionId: "piggy-sol-gang", orderBy: "PRICE_LOW_TO_HIGH", status: ["BUY_NOW"], traits: []}
    const result : any = await axios.post('https://apis.alpha.art/api/v1/collection', json)
    try{
        if(result.status === 200){
            return result.data.total;
        }
        else{
            console.error(`Error fetching floor price from solscan. Responseded with status ${result.status}`)
    }
    }
    catch(e){
        console.error(`Error etching floor price price from solscan.\n${e.message}`)
    }

}