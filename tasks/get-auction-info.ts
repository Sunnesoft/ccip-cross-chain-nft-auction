
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "./utils";
import { Wallet, ethers } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`get-auction-info`, `Get CrossChainVickreyAuction information`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, auctionContract, nftTokenContract, tokenId } = taskArguments;

        const privateKey = getPrivateKey();
        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);

        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        console.log(`Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
        spinner.start();
        const info = await auction.getAuctionInfo(nftTokenContract, tokenId);
        spinner.stop();
        console.log(`getAuctionInfo request sent, response: ${info}`);

        console.log(`Task get-auction-info finished`);
    })