// Gets funds from users
// withdraw
// set min value in usd

// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./PriceConverterLib.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    //Type Declarations
    using PriceConverter for uint256;

    //State Variables
    // i => immutable, cheapest variables
    // s => storage, costliest
    uint256 public constant MINUSD = 50 * 1e18;

    address[] private funders;
    mapping(address => uint256) private amtFunded;

    address private immutable i_owner;

    AggregatorV3Interface private priceFeed;

    //modifiers
    modifier onlyOwnerAccess() {
        require(msg.sender == i_owner, "Sender is not owner");
        _; // rest of the code
    }

    // functions
    constructor(address priceFeedAddress) {
        i_owner = msg.sender; // whoever is deploying the contract
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        //require(getConversionRate(msg.value) >= MINUSD, "Less Than Min Value"); // 1e10 == 1 * 10 ** 18 (18 decimal places)
        require(
            msg.value.getConversionRate(priceFeed) >= MINUSD,
            "Less Than Min Value."
        );

        funders.push(msg.sender);
        amtFunded[msg.sender] = msg.value;
    }

    function withdraw() public payable onlyOwnerAccess {
        // funders array, which contains the addresses of all users who have contributed funds (amtFunded mapping).
        //For each funder, it sets their funded amount to zero (amtFunded[funder] = 0), effectively clearing their contribution.

        // for loop costs a lot to read from stoarge variable funders
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            amtFunded[funder] = 0;
        }

        //It then resets the funders array to an empty array (new address ), effectively clearing the list of funders.
        funders = new address[](0); // reset

        // transfer
        // msg.sender = address
        // address(this) sends whole contract address
        payable(msg.sender).transfer(address(this).balance);

        // send
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Failed");

        //call
        // (bool success, ) = payable(msg.sender).call{
        //     value: address(this).balance
        // }("");
        // require(success, "Failed");
    }

    function cheaperWithdraw() public payable onlyOwnerAccess {
        address[] memory m_funders = funders; // memory is cheaper than storage. funders is storage variable
        // mapping not allowed in memory
        for (uint256 i = 0; i < m_funders.length; i++) {
            address funder = m_funders[i];
            amtFunded[funder] = 0;
        }
        funders = new address[](0); // reset
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Failed");
    }

    //getters
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 i) public view returns (address) {
        return funders[i];
    }

    function getAmtFunded(address funder) public view returns (uint256) {
        return amtFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
