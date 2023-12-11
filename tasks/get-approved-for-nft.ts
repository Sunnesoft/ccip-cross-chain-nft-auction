import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { ethers } from "ethers";
import { CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task('get-approved-for-nft', 'Gets approved address of CrossChainNFT')
    .addParam(`nft`, `The address of the CrossChainNFT smart contract`)
    .addParam(`blockchain`, `The blockchain where the CrossChainNFT smart contract was deployed`)
    .addParam(`tokenId`, `The address to check the balance of CrossChainNFT`)
    .setAction(async (taskArguments: TaskArguments) => {
        const rpcProviderUrl = getProviderRpcUrl(taskArguments.blockchain);
        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);

        const spinner: Spinner = new Spinner();

        const nft: CrossChainNFT = CrossChainNFT__factory.connect(taskArguments.nft, provider);

        console.log(`Attempting to get approved of CrossChainNFT (${taskArguments.nft}) tokenId ${taskArguments.tokenId}`);
        spinner.start();

        const approved = await nft.getApproved(taskArguments.tokenId);

        spinner.stop();
        console.log(`The approved address of CrossChainNFT (${taskArguments.nft}) tokenId ${taskArguments.tokenId} is the ${approved} account`);
    })