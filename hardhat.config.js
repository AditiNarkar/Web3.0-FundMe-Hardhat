require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("dotenv").config();


const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;


module.exports = {
    //solidity: "0.8.19",
    solidity: {
        compilers: [
            { version: "0.8.19" },
            { version: "0.8.0" }
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111, // from chainlink.org
            blockConfirmations: 4,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, //first account in the list of available accounts
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        currency: "INR",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
};
