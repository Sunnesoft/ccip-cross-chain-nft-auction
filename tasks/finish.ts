
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { Wallet, ethers } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";
import { getCcipMessageId } from "./helpers";

task(`finish`, `Finish the auction of CrossChainVickreyAuction.sol`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`pk`, `private key of sender`)
    .addParam(`value`, `value for cross chain fee`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, auctionContract, nftTokenContract, tokenId, pk, value } = taskArguments;

        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(pk);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        console.log(`Attempting to call the finish function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
        spinner.start();
        const options = {value: ethers.parseEther(value)};
        const tx = await auction.finish(nftTokenContract, tokenId, options);
        const receipt = await tx.wait();
        spinner.stop();
        console.log(`finish request sent, transaction hash: ${tx.hash}`);
        
        if(receipt != null) {
            await getCcipMessageId(tx, receipt, sourceProvider);    
        } else {
            console.log(`Receipt is null`);
        }

        console.log(`Task finish succeeded`);
    })