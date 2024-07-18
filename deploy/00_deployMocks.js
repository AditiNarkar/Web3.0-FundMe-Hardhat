// fake contract
// only required for local testing 

const { network } = require("hardhat")
const { devChains, DECIMALS, INITIAL_ANS } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    
    if (devChains.includes(network.name)) {
        log("Local Network.")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANS] // constructor parameters
        })
        log("Mocks Deployed...")
        log("------------------")
    }
}
module.exports.tags = ["all", "mocks"]
