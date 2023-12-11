import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { ethers } from "ethers";
import { CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task('owner-of-nft', 'Gets the owner of CrossChainNFT for provided tokenId')
    .addParam(`nft`, `The address of the CrossChainNFT smart contract`)
    .addParam(`blockchain`, `The blockchain where the CrossChainNFT smart contract was deployed`)
    .addParam(`tokenId`, `The address to check the balance of CrossChainNFT`)
    .setAction(async (taskArguments: TaskArguments) => {
        const rpcProviderUrl = getProviderRpcUrl(taskArguments.blockchain);
        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);

        const spinner: Spinner = new Spinner();

        const nft: CrossChainNFT = CrossChainNFT__factory.connect(taskArguments.nft, provider);

        console.log(`Attempting to get the owner of CrossChainNFT (${taskArguments.nft}) tokenId ${taskArguments.tokenId}`);
        spinner.start();

        const owner = await nft.ownerOf(taskArguments.tokenId);

        spinner.stop();
        console.log(`The owner of CrossChainNFT (${taskArguments.nft}) tokenId ${taskArguments.tokenId} is the ${owner} account`);
    })