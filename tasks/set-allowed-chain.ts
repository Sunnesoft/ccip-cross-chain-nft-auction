
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl, getRouterConfig } from "./utils";
import { Wallet, ethers } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`set-allowed-chain`, `Add allowed chain to CrossChainVickreyAuction`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`destinationBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`receiver`, `The address of the CrossChainVickreyAuction.sol in destination blockchain`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, destinationBlockchain, auctionContract, receiver } = taskArguments;

        const privateKey = getPrivateKey();
        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const chainSelector = getRouterConfig(destinationBlockchain).chainSelector;
        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        console.log(`Attempting to call the setAllowedChain function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
        spinner.start();
        const tx = await auction.setAllowedChain(chainSelector, receiver);
        const receipt = await tx.wait();
        spinner.stop();
        console.log(`setAllowedChain request sent, transaction hash: ${tx.hash}`);
        
        if(receipt != null) {
            console.log(`Receipt: ${JSON.stringify(receipt.toJSON())}`);  
        } else {
            console.log(`Receipt is null`);
        }

        console.log(`Task set-allowed-chain finished with the execution`);
    })