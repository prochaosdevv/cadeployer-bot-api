exports.symbols = {
    [56] : "BNB",
    [97] : "tBNB",
    [1] : "ETH",
    [42161] : "ETH",

}

exports.CONTRACT_URL = {
    [56] : "https://bscscan.com/address/",
    [97] : "https://testnet.bscscan.com/address/",
    [1] : "https://etherscan.io/address/",
    [42161] : "https://arbiscan.io/address/"
}

exports.PROVIDER = {
    [56] : "https://bsc-dataseed1.binance.org/",
    [97] : "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    [1] : "https://rpc.ankr.com/eth",
    [42161] : "https://arb1.arbitrum.io/rpc"
}

exports.UNISWAP_ROUTER = {    
    [56] : "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    [1] : "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    [42161] : "0xE592427A0AEce92De3Edee1F18E0157C05861564"
}

exports.PANCAKE_ROUTER = {    
    [97] : "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    [56] : "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    [1] : "0xEfF92A263d31888d860bD50809A8D171709b7b1c",
    [42161] : "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb"
}

exports.API_KEYS = {
    [97] : process.env.BSCTESTAPI,
    [56] : process.env.BSCAPI,
    [1] : process.env.ETHAPI,
    [42161] : process.env.ARBIAPI
}
