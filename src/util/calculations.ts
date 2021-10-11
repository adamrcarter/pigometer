export const calculateSOLPerPig = (lamports : number, numDelistedPigs : number = 10000) : number =>{
    const sol = lamports / 1000000000;
    const perPig = Math.round((sol/numDelistedPigs) * 100) / 100
    return perPig
}

export const calculateUSDPerPig = (lamports : number, usdtPrice : number, numDelistedPigs : number = 10000) : number =>{
    const solPerPig = calculateSOLPerPig(lamports)
    const usdPerPig = Math.round((usdtPrice * solPerPig) * 100) / 100
    return usdPerPig
}