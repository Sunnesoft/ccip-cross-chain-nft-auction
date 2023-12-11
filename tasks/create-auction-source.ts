
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl } from "./utils";
import { Wallet, ethers, CallExceptionError, BytesLike } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory, CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`create-auction-source`, `Creates the new CrossChainVickreyAuction in source network`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`startTime`, `start time timestamp`)
    .addParam(`bidPeriod`, `bid period`)
    .addParam(`revealPeriod`, `reveal period`)
    .addParam(`replyPeriod`, `reply period`)
    .addParam(`collateral`, `collateral value similar for all bidders`)
    .addParam(`pk`, `private key of sender`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, auctionContract, nftTokenContract, tokenId, startTime, bidPeriod, revealPeriod, replyPeriod, collateral, pk } = taskArguments;

        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);

        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const wallet = new Wallet(pk);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const nft: CrossChainNFT = CrossChainNFT__factory.connect(nftTokenContract, signer);

        console.log(`Attempting to approve tokenId of CrossChainNFT (${taskArguments.nftTokenContract}) for the ${taskArguments.auctionContract} account`);
        spinner.start();
        const txApprove = await nft.approve(auctionContract, tokenId);
        await txApprove.wait();
        spinner.stop();
        console.log(`Approve is done, transaction hash: ${txApprove.hash}`);

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        try {
            console.log(`Attempting to call the create function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
            spinner.start();

            const tx = await auction["create(address,uint256,uint32,uint32,uint32,uint32,uint256)"](
                nftTokenContract,
                tokenId,
                startTime,
                bidPeriod,
                revealPeriod,
                replyPeriod,
                collateral
            );
            const receipt = await tx.wait();
    
            spinner.stop();
            console.log(`Create request sent, transaction hash: ${tx.hash}`);

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

        console.log(`Task create-auction-source finished with the execution`);
    })