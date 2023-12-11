/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  ChainRegistry,
  ChainRegistryInterface,
} from "../../contracts/ChainRegistry";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
    ],
    name: "NotAllowedChainError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "sourceChainSelector",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "hasPermission",
    outputs: [
      {
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
    ],
    name: "isAllowedChain",
    outputs: [
      {
        internalType: "bool",
        name: "status",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "setAllowedChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5033806000816100675760405162461bcd60e51b815260206004820152601860248201527f43616e6e6f7420736574206f776e657220746f207a65726f000000000000000060448201526064015b60405180910390fd5b600080546001600160a01b0319166001600160a01b0384811691909117909155811615610097576100978161009f565b505050610148565b336001600160a01b038216036100f75760405162461bcd60e51b815260206004820152601760248201527f43616e6e6f74207472616e7366657220746f2073656c66000000000000000000604482015260640161005e565b600180546001600160a01b0319166001600160a01b0383811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b610414806101576000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80631d772de51461006757806379ba5097146100b15780637ab08335146100bb5780638da5cb5b146100ce578063dea99587146100e9578063f2fde38b14610124575b600080fd5b61009c610075366004610357565b67ffffffffffffffff166000908152600260205260409020546001600160a01b0316151590565b60405190151581526020015b60405180910390f35b6100b9610137565b005b6100b96100c9366004610390565b6101e6565b6000546040516001600160a01b0390911681526020016100a8565b61009c6100f7366004610390565b67ffffffffffffffff919091166000908152600260205260409020546001600160a01b0391821691161490565b6100b96101323660046103c3565b610228565b6001546001600160a01b0316331461018f5760405162461bcd60e51b815260206004820152601660248201527526bab9ba10313290383937b837b9b2b21037bbb732b960511b60448201526064015b60405180910390fd5b60008054336001600160a01b0319808316821784556001805490911690556040516001600160a01b0390921692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a350565b6101ee61023c565b67ffffffffffffffff91909116600090815260026020526040902080546001600160a01b0319166001600160a01b03909216919091179055565b61023061023c565b61023981610291565b50565b6000546001600160a01b0316331461028f5760405162461bcd60e51b815260206004820152601660248201527527b7363c9031b0b63630b1363290313c9037bbb732b960511b6044820152606401610186565b565b336001600160a01b038216036102e95760405162461bcd60e51b815260206004820152601760248201527f43616e6e6f74207472616e7366657220746f2073656c660000000000000000006044820152606401610186565b600180546001600160a01b0319166001600160a01b0383811691821790925560008054604051929316917fed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae12789190a350565b803567ffffffffffffffff8116811461035257600080fd5b919050565b60006020828403121561036957600080fd5b6103728261033a565b9392505050565b80356001600160a01b038116811461035257600080fd5b600080604083850312156103a357600080fd5b6103ac8361033a565b91506103ba60208401610379565b90509250929050565b6000602082840312156103d557600080fd5b6103728261037956fea26469706673582212205c8bae77ce6add390f1b10729195f95c9a1678e868f66b46f6a188aa34725e2964736f6c63430008130033";

type ChainRegistryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ChainRegistryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ChainRegistry__factory extends ContractFactory {
  constructor(...args: ChainRegistryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ChainRegistry & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ChainRegistry__factory {
    return super.connect(runner) as ChainRegistry__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ChainRegistryInterface {
    return new Interface(_abi) as ChainRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ChainRegistry {
    return new Contract(address, _abi, runner) as unknown as ChainRegistry;
  }
}
