

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { getProviderRpcUrl, getRouterConfig, getPrivateKey } from "./utils";
import { Wallet, ethers } from "ethers";
import { CrossChainVickreyAuction, CrossChainNFT, CrossChainNFT__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";

task(`deploy-auction`, `Deploys CrossChainNFT.sol and CrossChainVickreyAuction.sol smart contracts`)
    .addOptionalParam(`router`, `The address of the Router contract on the destination blockchain`)
    .addParam(`tokenAddress`, `The address of the ERC20 token used for payments`)
    .addParam(`gasLimit`, `GasLimit value for cross chain transaction`)
    .addParam(`strict`, `Prevent any following messages from the same sender from being processed until the current message is successfully executed (true|false)`)
    .addParam(`sourceChainName`, `if this value is not equal network then deploy nft and transfer ownership to Auction contract`)
    .addOptionalParam(`nftName`, `NFT name`)
    .addOptionalParam(`nftSymbol`, `NFT symbol`)
    .addOptionalParam(`nftTokenContract`, `nft token contract address`)
    .setAction(async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const routerAddress = taskArguments.router ? taskArguments.router : getRouterConfig(hre.network.name).address;
        const tokenAddress = taskArguments.tokenAddress;
        const gasLimit = taskArguments.gasLimit;
        const strict = taskArguments.strict;
        const sourceChainName = taskArguments.sourceChainName;
        const nftName = taskArguments.nftName;
        const nftSymbol = taskArguments.nftSymbol;
        const chainSelector = getRouterConfig(hre.network.name).chainSelector;
        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderRpcUrl(hre.network.name);
        const nftTokenContract = taskArguments.nftTokenContract;

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const deployer = wallet.connect(provider);

        const spinner: Spinner = new Spinner();

        console.log(`Attempting to deploy CrossChainVickreyAuction smart contract on the ${hre.network.name} blockchain using ${deployer.address} address, with the Router address ${routerAddress} provided as constructor argument`);
        spinner.start();

        const destinationAuction: CrossChainVickreyAuction = await hre.ethers.deployContract("CrossChainVickreyAuction", [routerAddress, tokenAddress, chainSelector, gasLimit, strict]);
        await destinationAuction.waitForDeployment();

        spinner.stop();
        console.log(`CrossChainVickreyAuction contract deployed at address ${destinationAuction.target} on the ${hre.network.name} blockchain`);

        let nft: CrossChainNFT;

        if (nftTokenContract) {
            nft = CrossChainNFT__factory.connect(nftTokenContract, deployer);
        } else {
            console.log(`Attempting to deploy CrossChainNFT smart contract on the ${hre.network.name} blockchain using ${deployer.address} address`);
            spinner.start();
            
            nft = await hre.ethers.deployContract("CrossChainNFT", [nftName, nftSymbol]);
            await nft.waitForDeployment();
    
            spinner.stop();
            console.log(`CrossChainNFT contract deployed at address ${nft.target} on the ${hre.network.name} blockchain`)
        }

        if (hre.network.name != sourceChainName) {
            console.log(`Attempting to grant the minter role to the CrossChainVickreyAuction smart contract`);
            spinner.start();
            
            const tx = await nft.transferOwnership(destinationAuction.getAddress());
            await tx.wait();
    
            spinner.stop();
            console.log(`CrossChainVickreyAuction can now mint CrossChainNFTs. Transaction hash: ${tx.hash}`);
        }
    })