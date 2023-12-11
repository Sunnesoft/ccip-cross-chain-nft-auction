
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getProviderRpcUrl, getRouterConfig } from "./utils";
import { Wallet, ethers, CallExceptionError, BytesLike } from "ethers";
import { CrossChainVickreyAuction, CrossChainVickreyAuction__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";
import { getCcipMessageId } from "./helpers";

task(`create-auction-destination`, `Creates the new CrossChainVickreyAuction in destination network`)
    .addParam(`sourceBlockchain`, `The name of the source blockchain (for example ethereumSepolia)`)
    .addParam(`destinationBlockchain`, `The name of the destination blockchain (for example ethereumSepolia)`)
    .addParam(`auctionContract`, `The address of the CrossChainVickreyAuction.sol smart contract on the source blockchain`)
    .addParam(`sourceNftTokenContract`, `source nft token contract address`)
    .addParam(`destinationNftTokenContract`, `destination nft token contract address`)
    .addParam(`tokenId`, `token id`)
    .addParam(`pk`, `private key of sender`)
    .addParam(`value`, `value for cross chain fee`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { sourceBlockchain, destinationBlockchain, auctionContract, sourceNftTokenContract, destinationNftTokenContract, tokenId, pk, value } = taskArguments;

        const rpcProviderUrl = getProviderRpcUrl(sourceBlockchain);
        const chainSelector = getRouterConfig(destinationBlockchain).chainSelector;

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(pk);
        const signer = wallet.connect(provider);

        const spinner: Spinner = new Spinner();

        const auction: CrossChainVickreyAuction = CrossChainVickreyAuction__factory.connect(auctionContract, signer);

        try {
            console.log(`Attempting to call the create function of the CrossChainVickreyAuction.sol smart contract on the ${sourceBlockchain} from ${signer.address} account`);
            spinner.start();
            const options = {value: ethers.parseEther(value)};
            const tx = await auction["create(address,address,uint256,uint64)"](
                sourceNftTokenContract,
                destinationNftTokenContract,
                tokenId,
                chainSelector,
                options
            );
            const receipt = await tx.wait();
            spinner.stop();
            console.log(`Create request sent, transaction hash: ${tx.hash}`);
            
            if(receipt != null) {
                await getCcipMessageId(tx, receipt, provider);    
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

        console.log(`Task create-auction-destination finished with the execution`);
    })