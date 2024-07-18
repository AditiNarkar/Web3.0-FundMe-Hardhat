//describe is a function typically used in testing frameworks like Mocha and Jest to group related tests together. It creates a test suite or a block of tests that share common setup or context.

const { deployments, ethers } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

// runs only on devChains
!devChains.includes(network.name)
    ? describe.skip
    :
    describe("FundMe", () => {

        // deploy FundMe using hardhat-deploy

        // fixture deployment is a set of contracts deployed to the blockchain for testing purposes.

        let fundMe, mockV3Aggregator, deployer
        const sendValue = ethers.parseEther("1") // 1 ETH

        beforeEach(async () => {
            // const accounts = await ethers.getSigners()
            // deployer = accounts[0]
            deployer = (await getNamedAccounts()).deployer
            console.log(`deployer is : ${deployer}`)


            await deployments.fixture(["all"])

            const myContract = await deployments.get("FundMe");
            // console.log("myContract: ", myContract)
            // console.log(`myContract.address : ${myContract.address}`)

            fundMe = await ethers.getContractAt(
                myContract.abi,
                myContract.address,
            );
            // console.log("fundme: ", fundMe)

            //fundMe = await ethers.getContractAt("FundMe", deployer)
            const mymockV3Aggregator = await deployments.get("MockV3Aggregator");
            mockV3Aggregator = await ethers.getContractAt(
                mymockV3Aggregator.abi,
                mymockV3Aggregator.address
            )
            // console.log("Mock:", mockV3Aggregator)
        })

        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.getPriceFeed()
                console.log(`response : ${response}`)
                assert.equal(response, mockV3Aggregator.target)
            })
        })

        describe("fund", async () => {
            it("fails if enough ETH isn't sent", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("Less Than Min Value.")
            })
            //yarn hardhat test --grep "amtFunded"
            it("Updates amtFunded data structure", async () => {
                console.log(`sendValue: ${sendValue}`)
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAmtFunded(deployer)
                console.log(`getAmtFunded: ${response.toString()}`)
                assert.equal(response.toString(), sendValue.toString())

            })
            it("Adds Funders to array", async () => {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunder(0)
                console.log(`Funder: ${funder}`)
                assert.equal(funder, deployer)

            })
        })

        describe("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })
            it("transfers money from single account to owner", async () => {
                // Arrange
                const contractBalance1 = await ethers.provider.getBalance(fundMe.target)
                console.log(`contractBalance1: ${contractBalance1}`)
                console.log(`fundMe.target: ${fundMe.target}`)

                const deployerBalance1 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance1: ${deployerBalance1}`)

                // Act
                const response = await fundMe.withdraw()
                const receipt = await response.wait(1)

                const { gasUsed, gasPrice } = receipt
                console.log(`gasCost: ${gasUsed} * ${gasPrice}`)

                const gasCost = gasUsed * gasPrice

                const contractBalance2 = await ethers.provider.getBalance(fundMe.target)
                const deployerBalance2 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance2: ${deployerBalance2}`)

                //Assert
                assert.equal(contractBalance2, 0)
                assert.equal(contractBalance1 + deployerBalance1, deployerBalance2 + gasCost)

            })

            it("Transfers money from multiple accounts to owner", async () => {
                const accounts = await ethers.getSigners()

                // 0th position is the deployer/owner
                for (let i = 0; i < 6; i++) {
                    // fundMe is currently connceted to deployer, so to make contract calls from another acc,
                    const fundMeOtherAcc = await fundMe.connect(accounts[i])
                    await fundMeOtherAcc.fund({ value: sendValue })
                }

                const contractBalance1 = await ethers.provider.getBalance(fundMe.target)
                console.log(`contractBalance1: ${contractBalance1}`)

                const deployerBalance1 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance1: ${deployerBalance1}`)

                //Act
                const response = await fundMe.withdraw()
                const receipt = await response.wait(1)

                const { gasUsed, gasPrice } = receipt
                console.log(`gasCost: ${gasUsed} * ${gasPrice}`)

                const gasCost = gasUsed * gasPrice

                const contractBalance2 = await ethers.provider.getBalance(fundMe.target)
                const deployerBalance2 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance2: ${deployerBalance2}`)

                //Assert
                assert.equal(contractBalance2, 0)
                assert.equal(contractBalance1 + deployerBalance1, deployerBalance2 + gasCost)

                // Make sure funders are reset
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 0; i < 6; i++) {
                    assert.equal(await fundMe.getAmtFunded(await accounts[i].getAddress()), 0)
                }
            })

            it("Cheaper Withraw Testing...", async () => {
                const accounts = await ethers.getSigners()

                // 0th position is the deployer/owner
                for (let i = 0; i < 6; i++) {
                    // fundMe is currently connceted to deployer, so to make contract calls from another acc,
                    const fundMeOtherAcc = await fundMe.connect(accounts[i])
                    await fundMeOtherAcc.fund({ value: sendValue })
                }

                const contractBalance1 = await ethers.provider.getBalance(fundMe.target)
                console.log(`contractBalance1: ${contractBalance1}`)

                const deployerBalance1 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance1: ${deployerBalance1}`)

                //Act
                const response = await fundMe.cheaperWithdraw()
                const receipt = await response.wait(1)

                const { gasUsed, gasPrice } = receipt
                console.log(`gasCost: ${gasUsed} * ${gasPrice}`)

                const gasCost = gasUsed * gasPrice

                const contractBalance2 = await ethers.provider.getBalance(fundMe.target)
                const deployerBalance2 = await ethers.provider.getBalance(deployer)
                console.log(`deployerBalance2: ${deployerBalance2}`)

                //Assert
                assert.equal(contractBalance2, 0)
                assert.equal(contractBalance1 + deployerBalance1, deployerBalance2 + gasCost)

                // Make sure funders are reset
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 0; i < 6; i++) {
                    assert.equal(await fundMe.getAmtFunded(await accounts[i].getAddress()), 0)
                }
            })
        })
    })