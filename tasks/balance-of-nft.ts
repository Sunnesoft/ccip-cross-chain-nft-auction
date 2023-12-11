import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { ethers } from "ethers";
import { CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task('balance-of-nft', 'Gets the balance of CrossChainNFT for provided address')
    .addParam(`nft`, `The address of the CrossChainNFT smart contract`)
    .addParam(`blockchain`, `The blockchain where the CrossChainNFT smart contract was deployed`)
    .addParam(`owner`, `The address to check the balance of CrossChainNFT`)
    .setAction(async (taskArguments: TaskArguments) => {
        const rpcProviderUrl = getProviderRpcUrl(taskArguments.blockchain);
        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);

        const spinner: Spinner = new Spinner();

        const nft: CrossChainNFT = CrossChainNFT__factory.connect(taskArguments.nft, provider);

        console.log(`Attempting to check the balance of CrossChainNFT (${taskArguments.nft}) for the ${taskArguments.owner} account`);
        spinner.start();

        const balanceOf = await nft.balanceOf(taskArguments.owner);

        spinner.stop();
        console.log(`The balance of CrossChainNFT of the ${taskArguments.owner} account is ${BigInt(balanceOf)}`);
    })