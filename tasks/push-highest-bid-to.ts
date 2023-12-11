
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getRouterConfig, getProviderRpcUrl } from "./utils";
import { Wallet, ethers, CallExceptionError, BytesLike } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";
import { getCcipMessageId } from "./helpers";

task(`push-highest-bid-to`, `Send auction highest bid to destination chain`)
    .addParam(`sourceBlockchain`, `The name of the blockchain from which you send message (for example ethereumSepolia)`)
    .addParam(`destinationBlockchain`, `The name of the blockchain to which you send message (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the blockchain`)
    .addParam(`nftTokenContract`, `nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`pk`, `private key of sender`)
    .addParam(`value`, `value for cross chain fee`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, destinationBlockchain, auctionContract, nftTokenContract, tokenId, pk, value } = taskArguments;

        const sourceRpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const sourceProvider = new ethers.JsonRpcProvider(sourceRpcProviderUrl);
        const chainSelector = getRouterConfig(destinationBlockchain).chainSelector;
        const wallet = new Wallet(pk);
        const signer = wallet.connect(sourceProvider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        try {
            console.log(`Attempting to call the pushHighestBidTo function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
            spinner.start();
            const options = {value: ethers.parseEther(value)};
            const tx = await auction.pushHighestBidTo(nftTokenContract, tokenId, chainSelector, options);
            const receipt = await tx.wait();
            spinner.stop();
            console.log(`pushHighestBidTo request sent, transaction hash: ${tx.hash}`);
            
            if(receipt != null) {
                await getCcipMessageId(tx, receipt, sourceProvider);    
            } else {
                console.log(`Receipt is null`);
            }
        } catch (error) {
            const e = error as CallExceptionError;
            if (e) {
                console.log(auction.interface.makeError(e.data as BytesLike, e.transaction));
            }
        }

        console.log(`Task pushHighestBidTo finished with the execution`);
    })