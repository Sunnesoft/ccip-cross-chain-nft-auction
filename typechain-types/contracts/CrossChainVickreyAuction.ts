/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace CrossChainVickreyAuction {
  export type AuctionInfoStruct = {
    seller: AddressLike;
    chainSelector: BigNumberish;
    startTime: BigNumberish;
    endOfBiddingPeriod: BigNumberish;
    endOfRevealPeriod: BigNumberish;
    endOfReplyPeriod: BigNumberish;
    tokenContract: AddressLike;
    collateral: BigNumberish;
    highestBid: BigNumberish;
    secondHighestBid: BigNumberish;
    highestBidder: AddressLike;
    highestBidderChainSelector: BigNumberish;
  };

  export type AuctionInfoStructOutput = [
    seller: string,
    chainSelector: bigint,
    startTime: bigint,
    endOfBiddingPeriod: bigint,
    endOfRevealPeriod: bigint,
    endOfReplyPeriod: bigint,
    tokenContract: string,
    collateral: bigint,
    highestBid: bigint,
    secondHighestBid: bigint,
    highestBidder: string,
    highestBidderChainSelector: bigint
  ] & {
    seller: string;
    chainSelector: bigint;
    startTime: bigint;
    endOfBiddingPeriod: bigint;
    endOfRevealPeriod: bigint;
    endOfReplyPeriod: bigint;
    tokenContract: string;
    collateral: bigint;
    highestBid: bigint;
    secondHighestBid: bigint;
    highestBidder: string;
    highestBidderChainSelector: bigint;
  };
}

export declare namespace Client {
  export type EVMTokenAmountStruct = {
    token: AddressLike;
    amount: BigNumberish;
  };

  export type EVMTokenAmountStructOutput = [token: string, amount: bigint] & {
    token: string;
    amount: bigint;
  };

  export type Any2EVMMessageStruct = {
    messageId: BytesLike;
    sourceChainSelector: BigNumberish;
    sender: BytesLike;
    data: BytesLike;
    destTokenAmounts: Client.EVMTokenAmountStruct[];
  };

  export type Any2EVMMessageStructOutput = [
    messageId: string,
    sourceChainSelector: bigint,
    sender: string,
    data: string,
    destTokenAmounts: Client.EVMTokenAmountStructOutput[]
  ] & {
    messageId: string;
    sourceChainSelector: bigint;
    sender: string;
    data: string;
    destTokenAmounts: Client.EVMTokenAmountStructOutput[];
  };
}

export interface CrossChainVickreyAuctionInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "acceptOwnership"
      | "auctions"
      | "bid"
      | "ccipReceive"
      | "create(address,uint256,uint32,uint32,uint32,uint32,uint256)"
      | "create(address,address,uint256,uint64)"
      | "finish"
      | "getAuctionInfo"
      | "getRouter"
      | "hasPermission"
      | "isAllowedChain"
      | "isAuctionInit"
      | "onERC721Received"
      | "owner"
      | "pushHighestBidTo"
      | "pushHighestBidToSource"
      | "reveal"
      | "setAllowedChain"
      | "supportsInterface"
      | "transferOwnership"
      | "withdrawCollateral"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AuctionCreated"
      | "BidRevealed"
      | "CrossChainBidsApplied"
      | "CrossChainNftMinted"
      | "MessageReceived"
      | "OwnershipTransferRequested"
      | "OwnershipTransferred"
      | "PaymentReceived"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "auctions",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "bid",
    values: [AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "ccipReceive",
    values: [Client.Any2EVMMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "create(address,uint256,uint32,uint32,uint32,uint32,uint256)",
    values: [
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "create(address,address,uint256,uint64)",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "finish",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getAuctionInfo",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "getRouter", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "hasPermission",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isAllowedChain",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isAuctionInit",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pushHighestBidTo",
    values: [AddressLike, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "pushHighestBidToSource",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "reveal",
    values: [AddressLike, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setAllowedChain",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawCollateral",
    values: [AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "auctions", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "bid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ccipReceive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "create(address,uint256,uint32,uint32,uint32,uint32,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "create(address,address,uint256,uint64)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "finish", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAuctionInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getRouter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "hasPermission",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAllowedChain",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAuctionInit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pushHighestBidTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "pushHighestBidToSource",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "reveal", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setAllowedChain",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawCollateral",
    data: BytesLike
  ): Result;
}

export namespace AuctionCreatedEvent {
  export type InputTuple = [
    chainSelector: BigNumberish,
    tokenContract: AddressLike,
    tokenId: BigNumberish,
    seller: AddressLike,
    startTime: BigNumberish,
    endOfBiddingPeriod: BigNumberish,
    endOfRevealPeriod: BigNumberish,
    endOfReplyPeriod: BigNumberish,
    collateral: BigNumberish
  ];
  export type OutputTuple = [
    chainSelector: bigint,
    tokenContract: string,
    tokenId: bigint,
    seller: string,
    startTime: bigint,
    endOfBiddingPeriod: bigint,
    endOfRevealPeriod: bigint,
    endOfReplyPeriod: bigint,
    collateral: bigint
  ];
  export interface OutputObject {
    chainSelector: bigint;
    tokenContract: string;
    tokenId: bigint;
    seller: string;
    startTime: bigint;
    endOfBiddingPeriod: bigint;
    endOfRevealPeriod: bigint;
    endOfReplyPeriod: bigint;
    collateral: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BidRevealedEvent {
  export type InputTuple = [
    tokenContract: AddressLike,
    tokenId: BigNumberish,
    commitment: BytesLike,
    bidder: AddressLike,
    nonce: BytesLike,
    bidValue: BigNumberish
  ];
  export type OutputTuple = [
    tokenContract: string,
    tokenId: bigint,
    commitment: string,
    bidder: string,
    nonce: string,
    bidValue: bigint
  ];
  export interface OutputObject {
    tokenContract: string;
    tokenId: bigint;
    commitment: string;
    bidder: string;
    nonce: string;
    bidValue: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CrossChainBidsAppliedEvent {
  export type InputTuple = [
    chainSelector: BigNumberish,
    tokenContract: AddressLike,
    tokenId: BigNumberish,
    highestBid: BigNumberish,
    secondHighestBid: BigNumberish,
    highestBidder: AddressLike
  ];
  export type OutputTuple = [
    chainSelector: bigint,
    tokenContract: string,
    tokenId: bigint,
    highestBid: bigint,
    secondHighestBid: bigint,
    highestBidder: string
  ];
  export interface OutputObject {
    chainSelector: bigint;
    tokenContract: string;
    tokenId: bigint;
    highestBid: bigint;
    secondHighestBid: bigint;
    highestBidder: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace CrossChainNftMintedEvent {
  export type InputTuple = [tokenContract: AddressLike, tokenId: BigNumberish];
  export type OutputTuple = [tokenContract: string, tokenId: bigint];
  export interface OutputObject {
    tokenContract: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MessageReceivedEvent {
  export type InputTuple = [messageId: BytesLike];
  export type OutputTuple = [messageId: string];
  export interface OutputObject {
    messageId: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferRequestedEvent {
  export type InputTuple = [from: AddressLike, to: AddressLike];
  export type OutputTuple = [from: string, to: string];
  export interface OutputObject {
    from: string;
    to: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [from: AddressLike, to: AddressLike];
  export type OutputTuple = [from: string, to: string];
  export interface OutputObject {
    from: string;
    to: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PaymentReceivedEvent {
  export type InputTuple = [
    tokenContract: AddressLike,
    tokenId: BigNumberish,
    value: BigNumberish
  ];
  export type OutputTuple = [
    tokenContract: string,
    tokenId: bigint,
    value: bigint
  ];
  export interface OutputObject {
    tokenContract: string;
    tokenId: bigint;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface CrossChainVickreyAuction extends BaseContract {
  connect(runner?: ContractRunner | null): CrossChainVickreyAuction;
  waitForDeployment(): Promise<this>;

  interface: CrossChainVickreyAuctionInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  acceptOwnership: TypedContractMethod<[], [void], "nonpayable">;

  auctions: TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [
      [
        boolean,
        CrossChainVickreyAuction.AuctionInfoStructOutput,
        bigint,
        bigint
      ] & {
        isInit: boolean;
        info: CrossChainVickreyAuction.AuctionInfoStructOutput;
        numUnrevealedBids: bigint;
        numReplyedChains: bigint;
      }
    ],
    "view"
  >;

  bid: TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish, commitment: BytesLike],
    [void],
    "nonpayable"
  >;

  ccipReceive: TypedContractMethod<
    [message: Client.Any2EVMMessageStruct],
    [void],
    "nonpayable"
  >;

  "create(address,uint256,uint32,uint32,uint32,uint32,uint256)": TypedContractMethod<
    [
      tokenContract: AddressLike,
      tokenId: BigNumberish,
      startTime: BigNumberish,
      bidPeriod: BigNumberish,
      revealPeriod: BigNumberish,
      replyPeriod: BigNumberish,
      collateral: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  "create(address,address,uint256,uint64)": TypedContractMethod<
    [
      sourceTokenContract: AddressLike,
      destinationTokenContract: AddressLike,
      tokenId: BigNumberish,
      destinationChainSelector: BigNumberish
    ],
    [void],
    "payable"
  >;

  finish: TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [void],
    "payable"
  >;

  getAuctionInfo: TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [CrossChainVickreyAuction.AuctionInfoStructOutput],
    "view"
  >;

  getRouter: TypedContractMethod<[], [string], "view">;

  hasPermission: TypedContractMethod<
    [sourceChainSelector: BigNumberish, sender: AddressLike],
    [boolean],
    "view"
  >;

  isAllowedChain: TypedContractMethod<
    [destinationChainSelector: BigNumberish],
    [boolean],
    "view"
  >;

  isAuctionInit: TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [boolean],
    "view"
  >;

  onERC721Received: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pushHighestBidTo: TypedContractMethod<
    [
      tokenAddress: AddressLike,
      tokenId: BigNumberish,
      destinationChainSelector: BigNumberish
    ],
    [void],
    "payable"
  >;

  pushHighestBidToSource: TypedContractMethod<
    [tokenAddress: AddressLike, tokenId: BigNumberish],
    [void],
    "payable"
  >;

  reveal: TypedContractMethod<
    [
      tokenContract: AddressLike,
      tokenId: BigNumberish,
      bidValue: BigNumberish,
      nonce: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  setAllowedChain: TypedContractMethod<
    [destinationChainSelector: BigNumberish, receiver: AddressLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  transferOwnership: TypedContractMethod<
    [to: AddressLike],
    [void],
    "nonpayable"
  >;

  withdrawCollateral: TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "acceptOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "auctions"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: BigNumberish],
    [
      [
        boolean,
        CrossChainVickreyAuction.AuctionInfoStructOutput,
        bigint,
        bigint
      ] & {
        isInit: boolean;
        info: CrossChainVickreyAuction.AuctionInfoStructOutput;
        numUnrevealedBids: bigint;
        numReplyedChains: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "bid"
  ): TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish, commitment: BytesLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "ccipReceive"
  ): TypedContractMethod<
    [message: Client.Any2EVMMessageStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "create(address,uint256,uint32,uint32,uint32,uint32,uint256)"
  ): TypedContractMethod<
    [
      tokenContract: AddressLike,
      tokenId: BigNumberish,
      startTime: BigNumberish,
      bidPeriod: BigNumberish,
      revealPeriod: BigNumberish,
      replyPeriod: BigNumberish,
      collateral: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "create(address,address,uint256,uint64)"
  ): TypedContractMethod<
    [
      sourceTokenContract: AddressLike,
      destinationTokenContract: AddressLike,
      tokenId: BigNumberish,
      destinationChainSelector: BigNumberish
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "finish"
  ): TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "getAuctionInfo"
  ): TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [CrossChainVickreyAuction.AuctionInfoStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRouter"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "hasPermission"
  ): TypedContractMethod<
    [sourceChainSelector: BigNumberish, sender: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isAllowedChain"
  ): TypedContractMethod<
    [destinationChainSelector: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isAuctionInit"
  ): TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "onERC721Received"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pushHighestBidTo"
  ): TypedContractMethod<
    [
      tokenAddress: AddressLike,
      tokenId: BigNumberish,
      destinationChainSelector: BigNumberish
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "pushHighestBidToSource"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, tokenId: BigNumberish],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "reveal"
  ): TypedContractMethod<
    [
      tokenContract: AddressLike,
      tokenId: BigNumberish,
      bidValue: BigNumberish,
      nonce: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setAllowedChain"
  ): TypedContractMethod<
    [destinationChainSelector: BigNumberish, receiver: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[to: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "withdrawCollateral"
  ): TypedContractMethod<
    [tokenContract: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "AuctionCreated"
  ): TypedContractEvent<
    AuctionCreatedEvent.InputTuple,
    AuctionCreatedEvent.OutputTuple,
    AuctionCreatedEvent.OutputObject
  >;
  getEvent(
    key: "BidRevealed"
  ): TypedContractEvent<
    BidRevealedEvent.InputTuple,
    BidRevealedEvent.OutputTuple,
    BidRevealedEvent.OutputObject
  >;
  getEvent(
    key: "CrossChainBidsApplied"
  ): TypedContractEvent<
    CrossChainBidsAppliedEvent.InputTuple,
    CrossChainBidsAppliedEvent.OutputTuple,
    CrossChainBidsAppliedEvent.OutputObject
  >;
  getEvent(
    key: "CrossChainNftMinted"
  ): TypedContractEvent<
    CrossChainNftMintedEvent.InputTuple,
    CrossChainNftMintedEvent.OutputTuple,
    CrossChainNftMintedEvent.OutputObject
  >;
  getEvent(
    key: "MessageReceived"
  ): TypedContractEvent<
    MessageReceivedEvent.InputTuple,
    MessageReceivedEvent.OutputTuple,
    MessageReceivedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferRequested"
  ): TypedContractEvent<
    OwnershipTransferRequestedEvent.InputTuple,
    OwnershipTransferRequestedEvent.OutputTuple,
    OwnershipTransferRequestedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "PaymentReceived"
  ): TypedContractEvent<
    PaymentReceivedEvent.InputTuple,
    PaymentReceivedEvent.OutputTuple,
    PaymentReceivedEvent.OutputObject
  >;

  filters: {
    "AuctionCreated(uint64,address,uint256,address,uint32,uint32,uint32,uint32,uint256)": TypedContractEvent<
      AuctionCreatedEvent.InputTuple,
      AuctionCreatedEvent.OutputTuple,
      AuctionCreatedEvent.OutputObject
    >;
    AuctionCreated: TypedContractEvent<
      AuctionCreatedEvent.InputTuple,
      AuctionCreatedEvent.OutputTuple,
      AuctionCreatedEvent.OutputObject
    >;

    "BidRevealed(address,uint256,bytes32,address,bytes32,uint256)": TypedContractEvent<
      BidRevealedEvent.InputTuple,
      BidRevealedEvent.OutputTuple,
      BidRevealedEvent.OutputObject
    >;
    BidRevealed: TypedContractEvent<
      BidRevealedEvent.InputTuple,
      BidRevealedEvent.OutputTuple,
      BidRevealedEvent.OutputObject
    >;

    "CrossChainBidsApplied(uint64,address,uint256,uint256,uint256,address)": TypedContractEvent<
      CrossChainBidsAppliedEvent.InputTuple,
      CrossChainBidsAppliedEvent.OutputTuple,
      CrossChainBidsAppliedEvent.OutputObject
    >;
    CrossChainBidsApplied: TypedContractEvent<
      CrossChainBidsAppliedEvent.InputTuple,
      CrossChainBidsAppliedEvent.OutputTuple,
      CrossChainBidsAppliedEvent.OutputObject
    >;

    "CrossChainNftMinted(address,uint256)": TypedContractEvent<
      CrossChainNftMintedEvent.InputTuple,
      CrossChainNftMintedEvent.OutputTuple,
      CrossChainNftMintedEvent.OutputObject
    >;
    CrossChainNftMinted: TypedContractEvent<
      CrossChainNftMintedEvent.InputTuple,
      CrossChainNftMintedEvent.OutputTuple,
      CrossChainNftMintedEvent.OutputObject
    >;

    "MessageReceived(bytes32)": TypedContractEvent<
      MessageReceivedEvent.InputTuple,
      MessageReceivedEvent.OutputTuple,
      MessageReceivedEvent.OutputObject
    >;
    MessageReceived: TypedContractEvent<
      MessageReceivedEvent.InputTuple,
      MessageReceivedEvent.OutputTuple,
      MessageReceivedEvent.OutputObject
    >;

    "OwnershipTransferRequested(address,address)": TypedContractEvent<
      OwnershipTransferRequestedEvent.InputTuple,
      OwnershipTransferRequestedEvent.OutputTuple,
      OwnershipTransferRequestedEvent.OutputObject
    >;
    OwnershipTransferRequested: TypedContractEvent<
      OwnershipTransferRequestedEvent.InputTuple,
      OwnershipTransferRequestedEvent.OutputTuple,
      OwnershipTransferRequestedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "PaymentReceived(address,uint256,uint256)": TypedContractEvent<
      PaymentReceivedEvent.InputTuple,
      PaymentReceivedEvent.OutputTuple,
      PaymentReceivedEvent.OutputObject
    >;
    PaymentReceived: TypedContractEvent<
      PaymentReceivedEvent.InputTuple,
      PaymentReceivedEvent.OutputTuple,
      PaymentReceivedEvent.OutputObject
    >;
  };
}
