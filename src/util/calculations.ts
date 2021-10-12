export const calculateSOLPerPig = (lamports : number, numDelistedPigs : number = 10000) : number =>{
    const sol = lamports / 1000000000;
    const perPig = sol/numDelistedPigs
    return perPig
}

export const calculateUSDPerPig = (lamports : number, usdtPrice : number, numDelistedPigs : number = 10000) : number =>{
    const solPerPig = calculateSOLPerPig(lamports)
    const usdPerPig = usdtPrice * solPerPig
    return usdPerPig
}