import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "./utils";
import { Wallet, ethers } from "ethers";
import { Spinner } from "../utils/spinner";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";

task(`withdraw-collateral`, `Withdraws collateral (in ERC20 tokens) from CrossChainVickreyAuction.sol`)
    .addParam(`blockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { blockchain, auctionContract, nftTokenContract, tokenId } = taskArguments;

        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderRpcUrl(blockchain);

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(provider);
        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);
        const spinner: Spinner = new Spinner();

        console.log(`Attempting to call the withdrawCollateral function of the CrossChainVickreyAuction.sol smart contract on the ${blockchain} from ${signer.address} account`);
        spinner.start();
        const tx = await auction.withdrawCollateral(nftTokenContract, tokenId);
        const receipt = await tx.wait();
        spinner.stop();
        console.log(`withdrawCollateral request sent, transaction hash: ${tx.hash}`);
        
        if(receipt != null) {
            console.log(`Receipt: ${JSON.stringify(receipt.toJSON())}`);  
        } else {
            console.log(`Receipt is null`);
        }

        console.log(`Task withdraw-collateral finished with the execution`);
    })