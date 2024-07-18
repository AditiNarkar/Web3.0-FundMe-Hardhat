// using hardhat-deploy
// deploying contract means uploading on BC to use.

require("dotenv").config()
const { networkConfig, devChains } = require("../helper-hardhat-config.js")
const { network } = require("hardhat")
const { verify } = require("../utils/verify.js")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if(!contract), deploy a minimal version for local testing (mocks)
    let ethUSDPriceFeedAddress
    
    // when using localhost or hardhat, use mock network
    if (devChains.includes(network.name)) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUSDAggregator.address
    }
    else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    }

    const args = [ethUSDPriceFeedAddress]

    const fundMeContract = await deploy("FundMe", {
        from: deployer,
        args: args, // priceFeed Address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMeContract.address, args)
    }

    log("------------------------------")
}

module.exports.tags = ["all", "mocks"]