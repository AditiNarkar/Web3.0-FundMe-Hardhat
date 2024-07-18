const { getNamedAccounts, ethers, network } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// doesnt run only on devChains, runs on sepolia
devChains.includes(network.name) ?
    describe.skip :
    describe("FundMe", async () => {
        let fundMe, deployer
        const sendValue = ethers.parseEther("1") // 1 ETH

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            console.log(`deployer is : ${deployer}`)

            const myContract = await deployments.get("FundMe");

            fundMe = await ethers.getContractAt(
                myContract.abi,
                myContract.address,
            );
        })

        it("allows people to fund and withdraw", async () => {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            const endBalance = await ethers.provider.getBalance(fundMe)
            assert.equal(endBalance.toString(), "0")
        })

    })