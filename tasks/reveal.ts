
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { Wallet, ethers, CallExceptionError, BytesLike } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory, ERC20__factory, ERC20 } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`reveal`, `Reveal the bid of CrossChainVickreyAuction.sol`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`bidValue`, `bid value`)
    .addParam(`nonce`, `nonce value`)
    .addParam(`pk`, `Private key of sender`)
    .addParam(`tokenContract`, `ERC20 token address`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, auctionContract, nftTokenContract, tokenId, bidValue, nonce, pk, tokenContract } = taskArguments;

        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(pk);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);
        const token: ERC20 = ERC20__factory.connect(tokenContract, signer);

        console.log(`Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
        spinner.start();
        const info = await auction.getAuctionInfo(nftTokenContract, tokenId);
        spinner.stop();
        console.log(`getAuctionInfo request sent, response: ${info}`);

        console.log(`Attempting to approve ERC0 tokens (${tokenContract}) for the ${auctionContract} account`);
        spinner.start();
        const txApprove = await token.approve(auctionContract, BigInt(bidValue) - info.collateral);
        await txApprove.wait();
        spinner.stop();
        console.log(`Approve is done, transaction hash: ${txApprove.hash}`);

        try {
            console.log(`Attempting to call the reveal function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
            spinner.start();
            const tx = await auction.reveal(nftTokenContract, tokenId, bidValue, nonce);
            const receipt = await tx.wait();
            spinner.stop();
            console.log(`reveal request sent, transaction hash: ${tx.hash}`);
            
            if(receipt != null) {
                console.log(`Receipt: ${JSON.stringify(receipt.toJSON())}`);  
            } else {
                console.log(`Receipt is null`);
            }
        } catch (error) {
            const e = error as CallExceptionError;
            if (e) {
                console.log(auction.interface.makeError(e.data as BytesLike, e.transaction));
            }
        }

        console.log(`Task reveal finished with the execution`);
    })