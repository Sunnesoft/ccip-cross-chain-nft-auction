// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";

contract ChainRegistry is OwnerIsCreator {
    error NotAllowedChainError(uint64 destinationChainSelector);

    mapping(uint64 destinationChainSelector => address receiver) internal receivers;

    function setAllowedChain(
        uint64 destinationChainSelector,
        address receiver
    ) 
        external 
        onlyOwner 
    {
        receivers[destinationChainSelector] = receiver;
    }

    function hasPermission(
        uint64 sourceChainSelector,
        address sender
    ) public view returns (bool status)
    {
        return receivers[sourceChainSelector] == sender;
    }

    modifier onlyAllowedChain(uint64 destinationChainSelector) {
        if(receivers[destinationChainSelector] == address(0)) {
            revert NotAllowedChainError(destinationChainSelector);
        }
        _;
    }

    modifier onlyAllowedChainOrSource(uint64 destinationChainSelector, uint64 sourceChain) {
        if(destinationChainSelector != sourceChain && receivers[destinationChainSelector] == address(0)) {
            revert NotAllowedChainError(destinationChainSelector);
        }
        _;
    }

    function isAllowedChain(uint64 destinationChainSelector) public view returns (bool status) {
        return receivers[destinationChainSelector] != address(0);
    }
}