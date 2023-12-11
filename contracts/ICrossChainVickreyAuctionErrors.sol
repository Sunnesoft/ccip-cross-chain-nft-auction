// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ICrossChainVickreyAuctionErrors {
    error RevealPeriodOngoingError();
    error BidPeriodOngoingError();
    error ReplyPeriodOngoingError();
    error BidPeriodTooShortError(uint32 bidPeriod);
    error RevealPeriodTooShortError(uint32 revealPeriod);
    error ReplyPeriodTooShortError(uint32 replyPeriod);
    error NotInRevealPeriodError();
    error NotInBidPeriodError();
    error NotInReplyPeriodError();
    error UnrevealedBidError();
    error CannotWithdrawError();
    error ZeroCommitmentError();
    error InvalidStartTimeError(uint32 startTime, uint256 curTime);
    error InvalidEndOfBiddingPeriodError(uint32 endOfBiddingPeriod);
    error InvalidEndOfRevealPeriodError(uint32 endOfRevealPeriod);
    error InvalidEndOfInitPeriodError(uint32 endOfInitPeriod);
    error InvalidEndOfReplyPeriodError(uint32 endOfReplyPeriod);
    error AuctionIsNotFinishedError();
    error AuctionIsNotInitializedError();
    error InvalidMinimumBidValueError();
    error InvalidOpeningError(bytes32 bidHash, bytes32 commitment);
    error CrossChainRivalAlreadyInitError(uint64 destinationChainSelector);
    error NotAllowedError();
    error CrossChainRivalDoesntExistError(uint64 destinationChainSelector);
    error FailedToTransferEthError(address target, uint256 value);
    error FailedToTransferTokenError(address owner, address target, uint256 value);
    error CantMintNftTokenError(address token, uint256 tokenId);
    error NftTokenBalanceIsZeroError(address token, uint256 tokenId);
    error InvalidCollateralValueError();
    error InvalidDestTokenArrayError();
    error CounterOfUnrepliedChainsMustBeZeroError();
}