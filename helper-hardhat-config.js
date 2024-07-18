const networkConfig = {
    11155111: {
        // if network is sepolia
        name: "sepolia",
        //0x694AA1769357215DE4FAC081bf1f309aDC325306
        ethUSDPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    137: {
        name: "Polygon",
        ethUSDPriceFeed: ""
    },
    // localhost
    5777:{
        name: "localhost"
    }
}

// chains that mocks are goin to be deployed on 
const devChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANS = 200000000000//2000.00000000

module.exports = {
    networkConfig, devChains, DECIMALS, INITIAL_ANS
}