// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {ChainRegistry} from "./ChainRegistry.sol";

contract CrossChainSender is ChainRegistry {
    address immutable router;
    address immutable token;
    bool immutable strict;
    uint256 immutable gasLimit;

    error InvalidValueForFeeError(uint256 value, uint256 fee);
    error UnknownSourceError();

    enum CCMessageSignature {
        Create,
        ReplyHighestBid,
        ApplyHighestBid,
        Pay,
        MintNft,
        BroadcastHighestBid
    }

    struct CCMessage {
        CCMessageSignature sig;
        bytes data;
    }

    constructor(address router_, address token_, uint256 gasLimit_, bool strict_) 
    {
        router = router_;
        token = token_;
        strict = strict_;
        gasLimit = gasLimit_;
    }

    function _sendMessageAndTokens(
        CCMessage memory data,
        uint256 tokenAmount,
        uint64 destinationChainSelector,
        uint256 value
    ) 
        internal
        returns (bytes32 messageId)
    {
        Client.EVMTokenAmount[] memory tokensToSendDetails = new Client.EVMTokenAmount[](1);
        tokensToSendDetails[0] = Client.EVMTokenAmount(token, tokenAmount);

        IERC20(tokensToSendDetails[0].token).approve(
            router,
            tokensToSendDetails[0].amount
        );

        address receiver = receivers[destinationChainSelector];

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(data),
            tokenAmounts: tokensToSendDetails,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: gasLimit,
                    strict: strict
                })
            ),
            feeToken: address(0)
        });

        return _sendRawMessage(message, destinationChainSelector, value);
    }

    function _sendMessage(
        CCMessage memory data,
        uint64 destinationChainSelector,
        uint256 value
    ) 
        internal
        returns (bytes32 messageId)
    {
        address receiver = receivers[destinationChainSelector];

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: abi.encode(data),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({
                    gasLimit: gasLimit,
                    strict: strict
                })
            ),
            feeToken: address(0)
        });

        return _sendRawMessage(message, destinationChainSelector, value);
    }

    function _sendRawMessage(
        Client.EVM2AnyMessage memory message,
        uint64 destinationChainSelector,
        uint256 value
    ) 
        internal
        returns (bytes32 messageId)
    {
        uint256 fee = IRouterClient(router).getFee(
            destinationChainSelector,
            message
        );

        if (value < fee) {
            revert InvalidValueForFeeError(value, fee);
        }
        messageId = IRouterClient(router).ccipSend{value: fee}(
            destinationChainSelector,
            message
        );

        return messageId;
    }
}