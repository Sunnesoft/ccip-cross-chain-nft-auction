
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { Wallet, ethers, CallExceptionError, BytesLike } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory, ERC20__factory, ERC20 } from "../typechain-types";
import { Spinner } from "../utils/spinner";
import { getCcipMessageId } from "./helpers";
import { LINK_ADDRESSES } from "./constants";

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
        const linkTokenAddress = LINK_ADDRESSES[sourceBlockchain];
        const linkToken: ERC20 = ERC20__factory.connect(linkTokenAddress, signer);

        try {
            console.log(`Attempting to approve ERC0 tokens (${linkTokenAddress}) for the ${auctionContract} account`);
            spinner.start();
            const txApprove = await linkToken.approve(auctionContract, ethers.parseEther(value));
            await txApprove.wait();
            spinner.stop();
            console.log(`Approve is done, transaction hash: ${txApprove.hash}`);

            console.log(`Attempting to call the finish function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
            spinner.start();
            const tx = await auction.finish(nftTokenContract, tokenId);
            const receipt = await tx.wait();
            spinner.stop();
            console.log(`finish request sent, transaction hash: ${tx.hash}`);
            
            if(receipt != null) {
                await getCcipMessageId(tx, receipt, sourceProvider);    
            } else {
                console.log(`Receipt is null`);
            }
        } catch (error) {
            console.log(error)
            const e = error as CallExceptionError;
            if (e) {
                console.log(auction.interface.makeError(e.data as BytesLike, e.transaction));
            }
        }

        console.log(`Task finish succeeded`);
    })