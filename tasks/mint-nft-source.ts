
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl, getPrivateKey } from "./utils";
import { Wallet, ethers } from "ethers";
import { CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`mint-nft-source`, `Mint nft of CrossChainNFT.sol in source chain`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain where original nft contract deployed (for example ethereumSepolia)`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`tokenUri`, `token uri`)
    .addParam(`address`, `address of receiver`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, nftTokenContract, tokenId, tokenUri, address } = taskArguments;

        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(getPrivateKey());
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const nft: CrossChainNFT = CrossChainNFT__factory.connect(nftTokenContract, signer);

        console.log(`Attempting to call the mint function of the CrossChainNFT.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
        spinner.start();
        const tx = await nft.mint(address, tokenId, tokenUri);
        const receipt = await tx.wait();
        spinner.stop();
        console.log(`mint request sent, transaction hash: ${tx.hash}`);
        
        if(receipt != null) {
            console.log(`Receipt: ${JSON.stringify(receipt.toJSON())}`);  
        } else {
            console.log(`Receipt is null`);
        }

        console.log(`Task mint-nft-source finished with the execution`);
    })