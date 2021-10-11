import axios from "axios";

export const poll = (apiFunc : Function, ms = 4000) =>{
    
    return setInterval(apiFunc, ms);

}

export const getPiggyBankLamports = async () =>{
    try{
        console.log('Fetching account details for piggybank')
        const accountDetails = await axios.get("https://api.solscan.io/account?address=9BVu8rNwzBRv1uz35D2ZPzbXXKtejEKFBitL8m1ykBan")
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