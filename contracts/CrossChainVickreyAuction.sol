// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

import {ICrossChainVickreyAuctionErrors} from "./ICrossChainVickreyAuctionErrors.sol";
import {CrossChainSender} from "./CrossChainSender.sol";
import {CrossChainNFT} from "./CrossChainNFT.sol";

contract CrossChainVickreyAuction is ReentrancyGuard, ICrossChainVickreyAuctionErrors, CCIPReceiver, CrossChainSender, IERC721Receiver {
    struct AuctionConfig {
        address seller;

        uint32 startTime;
        uint32 endOfBiddingPeriod;
        uint32 endOfRevealPeriod;
        uint32 endOfReplyPeriod;

        address tokenContract;
        uint256 collateral;       
    }

    struct AuctionInfo {
        address seller;
        uint64 chainSelector;

        uint32 startTime;
        uint32 endOfBiddingPeriod;
        uint32 endOfRevealPeriod;
        uint32 endOfReplyPeriod;

        address tokenContract;
        uint256 collateral;

        uint256 highestBid;
        uint256 secondHighestBid;

        address highestBidder;
        uint64 highestBidderChainSelector;
    }

    struct CrossChainAuctionRival {
        uint32 startTime;
        address tokenContract;
        uint256 highestBid;
        uint256 secondHighestBid;
        address highestBidder;
        bool revealed;
    }

    struct Auction {
        bool isInit;
        AuctionInfo info;
        uint64 numUnrevealedBids;
        uint64 numReplyedChains;
        mapping(address => Bid) bids;
        mapping(uint64 => CrossChainAuctionRival) rivals;
    }

    struct Bid {
        bytes32 commitment;
        uint256 collateral;
        uint32 startTime;
    }

    event AuctionCreated(
        uint64 chainSelector,
        address tokenContract,
        uint256 tokenId,
        address seller,
        uint32 startTime,
        uint32 endOfBiddingPeriod,
        uint32 endOfRevealPeriod,
        uint32 endOfReplyPeriod,
        uint256 collateral
    );

    event BidRevealed(
        address tokenContract,
        uint256 tokenId,
        bytes32 commitment,
        address bidder,
        bytes32 nonce,
        uint256 bidValue
    );

    event CrossChainBidsApplied(
        uint64 chainSelector,
        address tokenContract,
        uint256 tokenId,
        uint256 highestBid,
        uint256 secondHighestBid,
        address highestBidder
    );

    event CrossChainNftMinted(
        address tokenContract,
        uint256 tokenId
    );

    event PaymentReceived(
        address tokenContract,
        uint256 tokenId,
        uint256  value
    );

    event MessageReceived(
        bytes32 messageId
    );

    mapping(address => mapping(uint256 => Auction)) public auctions;

    uint64 immutable chainSelector;

    constructor(address router_, address token_, uint64 chain, uint256 gasLimit_, bool strict_) 
        CrossChainSender(router_, token_, gasLimit_, strict_)
        CCIPReceiver(router_)
    {
        chainSelector = chain;
    }

    function create(
        address tokenContract,
        uint256 tokenId,
        uint32 startTime, 
        uint32 bidPeriod,
        uint32 revealPeriod,
        uint32 replyPeriod,
        uint256 collateral
    ) 
        external 
        nonReentrant
    {
        if (startTime == 0) {
            startTime = uint32(block.timestamp) + 10 minutes;
        } else if (startTime < block.timestamp + 10 minutes) {
            revert InvalidStartTimeError(startTime, block.timestamp);
        }
        if (bidPeriod < 10 minutes) {
            revert BidPeriodTooShortError(bidPeriod);
        }
        if (revealPeriod < 10 minutes) {
            revert RevealPeriodTooShortError(revealPeriod);
        }
        if (replyPeriod < 10 minutes) {
            revert ReplyPeriodTooShortError(replyPeriod);
        }

        AuctionConfig memory cfg;
        {
            cfg.seller = msg.sender;
            cfg.startTime = startTime;
            cfg.endOfBiddingPeriod = startTime + bidPeriod;
            cfg.endOfRevealPeriod = cfg.endOfBiddingPeriod + revealPeriod;
            cfg.endOfReplyPeriod = cfg.endOfRevealPeriod + replyPeriod;
            cfg.collateral = collateral;
            cfg.tokenContract = tokenContract;
        }


        _create(
            chainSelector,
            tokenContract,
            tokenId,
            cfg
        );

        ERC721URIStorage(tokenContract).transferFrom(msg.sender, address(this), tokenId);
    } 

    function create(
        address sourceTokenContract,
        address destinationTokenContract,
        uint256 tokenId,
        uint64 destinationChainSelector
    ) 
        external
        payable
        nonReentrant
        onlyAllowedChain(destinationChainSelector) 
    {
        Auction storage auction = auctions[sourceTokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (
            auctionInfo.chainSelector != chainSelector || 
            auctionInfo.seller != msg.sender || 
            auctionInfo.startTime < block.timestamp
        ) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
        if (rival.startTime == auctionInfo.startTime) {
            revert CrossChainRivalAlreadyInitError(destinationChainSelector);
        }

        _sendMessage(CCMessage(CCMessageSignature.Create, abi.encode(
            sourceTokenContract,
            tokenId,
            AuctionConfig(
                auctionInfo.seller, 
                auctionInfo.startTime, 
                auctionInfo.endOfBiddingPeriod, 
                auctionInfo.endOfRevealPeriod, 
                auctionInfo.endOfReplyPeriod, 
                destinationTokenContract, 
                auctionInfo.collateral)
        )), destinationChainSelector, msg.value);

        rival.startTime = auctionInfo.startTime;
        rival.tokenContract = destinationTokenContract;
        rival.highestBid = 0;
        rival.secondHighestBid = 0;
        rival.highestBidder = address(0);
        rival.revealed = false;
    }

    function bid(
        address tokenContract, 
        uint256 tokenId, 
        bytes32 commitment
    )
        external
        nonReentrant
    {
        if (commitment == bytes32(0)) {
            revert ZeroCommitmentError();
        }

        Auction storage auction = auctions[tokenContract][tokenId];
        AuctionInfo storage auctionInfo = auction.info;

        if (
            block.timestamp < auctionInfo.startTime || 
            block.timestamp > auctionInfo.endOfBiddingPeriod
        ) {
            revert NotInBidPeriodError();
        }

        Bid storage bid_ = auction.bids[msg.sender];

        if (bid_.startTime != auctionInfo.startTime) {
            bid_.startTime = auctionInfo.startTime;
            auction.numUnrevealedBids++;
        }

        bid_.commitment = commitment;

        if (bid_.collateral < auctionInfo.collateral) {
            uint256 delta = auctionInfo.collateral - bid_.collateral;
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), delta);
            bid_.collateral += delta;
        }
    } 

    function reveal(
        address tokenContract,
        uint256 tokenId,
        uint256 bidValue,
        bytes32 nonce
    )
        external
        nonReentrant
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        AuctionInfo storage auctionInfo = auction.info;

        if (
            block.timestamp <= auctionInfo.endOfBiddingPeriod ||
            block.timestamp > auctionInfo.endOfRevealPeriod
        ) {
            revert NotInRevealPeriodError();
        }

        if (bidValue < auctionInfo.collateral) {
            revert InvalidMinimumBidValueError();
        }

        Bid storage bid_ = auction.bids[msg.sender];

        bytes32 bidHash = keccak256(abi.encode(
            nonce,
            bidValue,
            tokenContract,
            tokenId,
            auctionInfo.startTime
        ));
        if (bidHash != bid_.commitment) {
            revert InvalidOpeningError(bidHash, bid_.commitment);
        } else {
            bid_.commitment = bytes32(0);
            auction.numUnrevealedBids--;
        }

        uint256 collateral = bid_.collateral;        
        uint256 currentHighestBid = auctionInfo.highestBid;
        if (bidValue > currentHighestBid) {
            if (collateral < bidValue) {
                uint256 delta = bidValue - collateral;
                SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), delta);
                bid_.collateral += delta;
            }
            auctionInfo.highestBid = bidValue;
            auctionInfo.secondHighestBid = currentHighestBid;
            auctionInfo.highestBidder = msg.sender;
            auctionInfo.highestBidderChainSelector = chainSelector;

            emit BidRevealed(
                tokenContract,
                tokenId,
                bidHash,
                msg.sender,
                nonce,
                bidValue
            );

        } else {
            if (bidValue > auctionInfo.secondHighestBid) {
                auctionInfo.secondHighestBid = bidValue;
            }
            bid_.collateral = 0;
            SafeERC20.safeTransfer(IERC20(token), msg.sender, collateral);
        }
    } 

    function finish(address tokenContract, uint256 tokenId)
        external
        payable
        nonReentrant 
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;

        if (block.timestamp <= auctionInfo.endOfReplyPeriod) {
            revert AuctionIsNotFinishedError();
        }

        if (auction.numReplyedChains != 0) {
            revert CounterOfUnrepliedChainsMustBeZeroError();
        }

        address highestBidder = auctionInfo.highestBidder;
        if (highestBidder == address(0)) {
            if (chainSelector == auctionInfo.chainSelector) {
                ERC721URIStorage(tokenContract).safeTransferFrom(address(this), auctionInfo.seller, tokenId);
            }

            auction.isInit = false;
        } else {
            uint256 secondHighestBid = auctionInfo.secondHighestBid;

            if (secondHighestBid < auctionInfo.collateral) {
                secondHighestBid = auctionInfo.highestBid;
            }

            if (chainSelector == auctionInfo.chainSelector) {
                if (auctionInfo.highestBidderChainSelector == chainSelector) {
                    ERC721URIStorage(tokenContract).safeTransferFrom(address(this), highestBidder, tokenId);

                    Bid storage bid_ = auction.bids[highestBidder];
                    uint256 collateral = bid_.collateral;
                    bid_.collateral = 0;

                    SafeERC20.safeTransfer(IERC20(token), auctionInfo.seller, secondHighestBid);
                    if (collateral > secondHighestBid) {
                        SafeERC20.safeTransfer(IERC20(token), highestBidder, collateral - secondHighestBid);
                    }

                    auction.isInit = false;
                } else {
                    uint64 destinationChainSelector = auctionInfo.highestBidderChainSelector;
                    CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
                    if (rival.startTime != auctionInfo.startTime) {
                        revert NotAllowedError();
                    }

                    _sendMessage(CCMessage(CCMessageSignature.MintNft, abi.encode(
                        rival.tokenContract, 
                        tokenId,
                        auctionInfo.startTime,
                        ERC721URIStorage(tokenContract).tokenURI(tokenId)
                    )), destinationChainSelector, msg.value);
                }
            } else {
                if (auctionInfo.highestBidderChainSelector == chainSelector) {
                    CrossChainAuctionRival storage rival = auction.rivals[auctionInfo.chainSelector]; 
                    if (rival.startTime != auctionInfo.startTime) {
                        revert NotAllowedError();
                    }

                    ERC721URIStorage(tokenContract).safeTransferFrom(address(this), highestBidder, tokenId);

                    Bid storage bid_ = auction.bids[highestBidder];
                    uint256 collateral = bid_.collateral;
                    bid_.collateral = 0;
                    
                    _sendMessageAndTokens(CCMessage(CCMessageSignature.Pay, abi.encode(
                        rival.tokenContract, 
                        tokenId,
                        auctionInfo.startTime
                    )), secondHighestBid, auctionInfo.chainSelector, msg.value);

                    if (collateral > secondHighestBid) {
                        SafeERC20.safeTransfer(IERC20(token), highestBidder, collateral - secondHighestBid);
                    }

                    auction.isInit = false;
                }               
            }
        }
    }

    function pushHighestBidToSource(
        address tokenAddress,
        uint256 tokenId
    ) 
        external
        payable 
        nonReentrant 
    {
        Auction storage auction = auctions[tokenAddress][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector == chainSelector) {
            revert NotAllowedError();
        }

        uint64 destinationChainSelector = auctionInfo.chainSelector;
        CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
        if (rival.startTime != auctionInfo.startTime) {
            revert CrossChainRivalDoesntExistError(destinationChainSelector);
        }

        if (block.timestamp <= auctionInfo.endOfBiddingPeriod) {
            revert BidPeriodOngoingError();
        } else if (block.timestamp <= auctionInfo.endOfRevealPeriod) {
            if (auction.numUnrevealedBids != 0) {
                revert RevealPeriodOngoingError();
            }
        }

        if (auctionInfo.highestBidder == address(0)) {
            revert NotAllowedError();
        }

        _sendMessage(CCMessage(CCMessageSignature.ApplyHighestBid, abi.encode(
            rival.tokenContract, 
            tokenId,
            auctionInfo.startTime,
            auctionInfo.highestBid,
            auctionInfo.secondHighestBid,
            auctionInfo.highestBidder
        )), destinationChainSelector, msg.value);
    }

    function pushHighestBidTo(
        address tokenAddress,
        uint256 tokenId,
        uint64 destinationChainSelector
    ) 
        external
        payable 
        nonReentrant 
    {
        Auction storage auction = auctions[tokenAddress][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector != chainSelector) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
        if (rival.startTime != auctionInfo.startTime || !rival.revealed) {
            revert CrossChainRivalDoesntExistError(destinationChainSelector);
        }

        if (block.timestamp <= auctionInfo.endOfReplyPeriod) {
            revert ReplyPeriodOngoingError();
        }

        _sendMessage(CCMessage(CCMessageSignature.BroadcastHighestBid, abi.encode(
            rival.tokenContract, 
            tokenId,
            auctionInfo.startTime,
            auctionInfo.highestBidder,
            auctionInfo.highestBidderChainSelector
        )), destinationChainSelector, msg.value);

        auction.numReplyedChains--;
        rival.revealed = false;
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory receivedMessage
    ) internal override {
        bytes32 messageId = receivedMessage.messageId;
        uint64 sourceChainSelector = receivedMessage.sourceChainSelector;
        address source = abi.decode(receivedMessage.sender, (address));
        CCMessage memory message = abi.decode(receivedMessage.data, (CCMessage));

        if (!hasPermission(sourceChainSelector, source)) {
            revert UnknownSourceError();
        }

        if (message.sig == CCMessageSignature.Create) {
            (
                address sourceTokenContract,
                uint256 tokenId, 
                AuctionConfig memory cfg
            ) = abi.decode(
                message.data,
                (address, uint256, AuctionConfig)
            );
            _create(
                sourceChainSelector, 
                sourceTokenContract, 
                tokenId, 
                cfg
            );
        } else if (message.sig == CCMessageSignature.ApplyHighestBid) {
            (
                address tokenAddress, 
                uint256 tokenId, 
                uint32 startTime, 
                uint256 highestBid, 
                uint256 secondHighestBid, 
                address highestBidder
            ) = abi.decode(
                message.data,
                (address, uint256, uint32, uint256, uint256, address)
            );
            _applyHighestBid(
                sourceChainSelector,
                tokenAddress, 
                tokenId, 
                startTime, 
                highestBid, 
                secondHighestBid, 
                highestBidder
            );
        } else if (message.sig == CCMessageSignature.MintNft) {
            (
                address tokenAddress, 
                uint256 tokenId, 
                uint32 startTime, 
                string memory tokenURI
            ) = abi.decode(
                message.data,
                (address, uint256, uint32, string)
            );
            _mintNft(sourceChainSelector, tokenAddress, tokenId, startTime, tokenURI);
        } else if (message.sig == CCMessageSignature.Pay) {
            (
                address tokenAddress, 
                uint256 tokenId, 
                uint32 startTime
            ) = abi.decode(
                message.data,
                (address, uint256, uint32)
            );
            _transferPayment(sourceChainSelector, tokenAddress, tokenId, startTime, receivedMessage.destTokenAmounts);
        } else if (message.sig == CCMessageSignature.BroadcastHighestBid) {
            (
                address tokenAddress, 
                uint256 tokenId, 
                uint32 startTime,
                address highesBidder,
                uint64 highestBidderChainSelector
            ) = abi.decode(
                message.data,
                (address, uint256, uint32, address, uint64)
            );
            _unlockBids(sourceChainSelector, tokenAddress, tokenId, startTime, highesBidder, highestBidderChainSelector);
        }

        emit MessageReceived(messageId);
    }

    function _create(
        uint64 sourceChainSelector,
        address sourceTokenContract,
        uint256 tokenId,
        AuctionConfig memory cfg
    ) 
        internal 
        onlyAllowedChainOrSource(sourceChainSelector, chainSelector)
    {
        if (cfg.startTime < block.timestamp) {
            revert InvalidStartTimeError(cfg.startTime, block.timestamp);
        }
        if (cfg.startTime >= cfg.endOfBiddingPeriod) {
            revert InvalidEndOfBiddingPeriodError(cfg.endOfBiddingPeriod);
        }
        if (cfg.endOfBiddingPeriod >= cfg.endOfRevealPeriod) {
            revert InvalidEndOfRevealPeriodError(cfg.endOfRevealPeriod);
        }
        if (cfg.endOfRevealPeriod >= cfg.endOfReplyPeriod) {
            revert InvalidEndOfReplyPeriodError(cfg.endOfReplyPeriod);
        }

        _initAuction(
            sourceChainSelector, 
            sourceTokenContract, 
            tokenId,
            cfg
        );

        emit AuctionCreated(
            sourceChainSelector,
            cfg.tokenContract,
            tokenId,
            cfg.seller,
            cfg.startTime,
            cfg.endOfBiddingPeriod,
            cfg.endOfRevealPeriod,
            cfg.endOfReplyPeriod,
            cfg.collateral
        );
    }

    function _initAuction(        
        uint64 sourceChainSelector,
        address sourceTokenContract,
        uint256 tokenId,
        AuctionConfig memory cfg
    ) 
        internal    
    {
        Auction storage auction = auctions[cfg.tokenContract][tokenId];
        AuctionInfo storage auctionInfo = auction.info;

        auctionInfo.seller = cfg.seller;
        auctionInfo.startTime = cfg.startTime;
        auctionInfo.endOfBiddingPeriod = cfg.endOfBiddingPeriod;
        auctionInfo.endOfRevealPeriod = cfg.endOfRevealPeriod;
        auctionInfo.endOfReplyPeriod = cfg.endOfReplyPeriod;
        auctionInfo.highestBid = 0;
        auctionInfo.secondHighestBid = 0;
        auctionInfo.highestBidder = address(0);
        auctionInfo.collateral = cfg.collateral;
        auctionInfo.chainSelector = sourceChainSelector;
        auctionInfo.tokenContract = cfg.tokenContract;
        auction.isInit = true;
        auction.numUnrevealedBids = 0;
        auction.numReplyedChains = 0;

        if (sourceChainSelector != chainSelector) {
            CrossChainAuctionRival storage rival = auction.rivals[sourceChainSelector]; 
            rival.startTime = cfg.startTime;
            rival.tokenContract = sourceTokenContract;
        }
    }

    function _applyHighestBid(
        uint64 sourceChainSelector,
        address tokenContract,
        uint256 tokenId,
        uint32 startTime,
        uint256 highestBid,
        uint256 secondHighestBid,
        address highestBidder
    ) 
        internal 
        onlyAllowedChain(sourceChainSelector)
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector != chainSelector) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[sourceChainSelector]; 
        if (rival.startTime != auctionInfo.startTime || startTime != auctionInfo.startTime) {
            revert CrossChainRivalDoesntExistError(sourceChainSelector);
        }

        if (block.timestamp > auctionInfo.endOfReplyPeriod) {
            revert NotInReplyPeriodError();
        }

        rival.highestBid = highestBid;
        rival.secondHighestBid = secondHighestBid;
        rival.highestBidder = highestBidder;

        uint256 currentHighestBid = auctionInfo.highestBid;

        if (highestBid > currentHighestBid) {
            auctionInfo.highestBid = highestBid;
            auctionInfo.highestBidder = highestBidder;
            auctionInfo.highestBidderChainSelector = sourceChainSelector;

            if (currentHighestBid > secondHighestBid) {
                auctionInfo.secondHighestBid = currentHighestBid;
            } else {
                auctionInfo.secondHighestBid = secondHighestBid;
            }
        } else {
            if (auctionInfo.secondHighestBid < secondHighestBid) {
                auctionInfo.secondHighestBid = secondHighestBid;
            }
        }
        
        auction.numReplyedChains++;
        rival.revealed = true;

        emit CrossChainBidsApplied(
            sourceChainSelector,
            tokenContract,
            tokenId,
            highestBid,
            secondHighestBid,
            highestBidder
        );
    }

    function _unlockBids(
        uint64 sourceChainSelector,
        address tokenContract,
        uint256 tokenId,
        uint32 startTime,
        address highestBidder,
        uint64 highestBidderChainSelector
    ) 
        internal  
        onlyAllowedChain(sourceChainSelector)
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector == chainSelector) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[sourceChainSelector]; 
        if (rival.startTime != auctionInfo.startTime || startTime != auctionInfo.startTime) {
            revert CrossChainRivalDoesntExistError(sourceChainSelector);
        }

        if (block.timestamp <= auctionInfo.endOfReplyPeriod) {
            revert AuctionIsNotFinishedError();
        }

        if (auctionInfo.highestBidder != highestBidder && highestBidderChainSelector != chainSelector) {
            auction.isInit = false;
        }
    }

    function _mintNft(
        uint64 destinationChainSelector,
        address tokenContract, 
        uint256 tokenId, 
        uint32 startTime, 
        string memory tokenURI
    ) 
        internal 
        onlyAllowedChain(destinationChainSelector)
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector == chainSelector) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
        if (rival.startTime != auctionInfo.startTime || startTime != auctionInfo.startTime) {
            revert CrossChainRivalDoesntExistError(destinationChainSelector);
        }

        if (block.timestamp <= auctionInfo.endOfReplyPeriod) {
            revert AuctionIsNotFinishedError();
        }

        try ERC721URIStorage(tokenContract).ownerOf(tokenId) returns (address owner) {
            if (owner != address(this)) {
                revert NotAllowedError();
            }
        } catch {
            CrossChainNFT(auctionInfo.tokenContract).mint(address(this), tokenId, tokenURI);
        }
        
        emit CrossChainNftMinted(
            tokenContract,
            tokenId
        );
    }

    function _transferPayment(
        uint64 destinationChainSelector,
        address tokenContract, 
        uint256 tokenId, 
        uint32 startTime,
        Client.EVMTokenAmount[] memory destToken
    ) 
        internal
        onlyAllowedChain(destinationChainSelector)
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        if (!auction.isInit) {
            revert AuctionIsNotInitializedError();
        }

        AuctionInfo storage auctionInfo = auction.info;
        if (auctionInfo.chainSelector != chainSelector) {
            revert NotAllowedError();
        }

        CrossChainAuctionRival storage rival = auction.rivals[destinationChainSelector]; 
        if (rival.startTime != auctionInfo.startTime || startTime != auctionInfo.startTime) {
            revert CrossChainRivalDoesntExistError(destinationChainSelector);
        }

        if (block.timestamp <= auctionInfo.endOfReplyPeriod) {
            revert AuctionIsNotFinishedError();
        }

        address highestBidder = auctionInfo.highestBidder;
        if (highestBidder != address(0)) {
            uint256 secondHighestBid = auctionInfo.secondHighestBid;

            if (destToken.length != 1 || destToken[0].token != token || destToken[0].amount < secondHighestBid) {
                revert InvalidDestTokenArrayError();
            }

            SafeERC20.safeTransfer(IERC20(token), auctionInfo.seller, secondHighestBid);

            emit PaymentReceived(
                tokenContract,
                tokenId,
                secondHighestBid
            );

            auction.isInit = false;
        }
    }

    function withdrawCollateral(
        address tokenContract,
        uint256 tokenId
    )
        external
        nonReentrant        
    {
        Auction storage auction = auctions[tokenContract][tokenId];
        AuctionInfo storage auctionInfo = auction.info;

        Bid storage bid_ = auction.bids[msg.sender];

        if (auction.isInit && auctionInfo.startTime == bid_.startTime) {
            if (bid_.commitment != bytes32(0)) {
                revert UnrevealedBidError();
            }
            
            if (
                msg.sender == auctionInfo.highestBidder && 
                chainSelector == auctionInfo.highestBidderChainSelector
            ) {
                revert CannotWithdrawError();    
            }
        }

        uint256 collateral = bid_.collateral;

        if (collateral == 0) {
            revert CannotWithdrawError(); 
        }

        bid_.collateral = 0;
        bid_.commitment = bytes32(0);
        SafeERC20.safeTransfer(IERC20(token), msg.sender, collateral);
    }

    function getAuctionInfo(address tokenContract, uint256 tokenId)
        external
        view
        returns (AuctionInfo memory auction)
    {
        return auctions[tokenContract][tokenId].info;
    }

    function isAuctionInit(address tokenContract, uint256 tokenId)
        external
        view
        returns (bool status)
    {
        return auctions[tokenContract][tokenId].isInit;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}