import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { getPrivateKey, getProviderRpcUrl } from "./utils";
import { Wallet, ethers } from "ethers";
import { IERC20, IERC20__factory } from "../typechain-types";
import { Spinner } from "../utils/spinner";


task(`faucet`, `Transfers the provided amount of ERC20 token or native coin to the recipient`)
    .addParam(`blockchain`, `The name of the blockchain (for example ethereumSepolia)`)
    .addParam(`recipient`, `The address of a recipient`)
    .addParam(`amount`, `Amount to send`)
    .addOptionalParam(`tokenContract`, `Token to send address (if omit then native)`)
    .setAction(async (taskArguments: TaskArguments) => {
        const { blockchain, recipient, amount, tokenContract } = taskArguments;

        const privateKey = getPrivateKey();
        const rpcProviderUrl = getProviderRpcUrl(blockchain);

        const provider = new ethers.JsonRpcProvider(rpcProviderUrl);
        const wallet = new Wallet(privateKey);
        const signer = wallet.connect(provider);
        const spinner: Spinner = new Spinner();

        if (!tokenContract) {
            console.log(`Attempting to send ${amount} of ${blockchain} native coins from ${signer.address} to ${recipient}`);
            spinner.start();

            const tx = await signer.sendTransaction({ to: recipient, value: amount });
            await tx.wait();

            spinner.stop();
            console.log(`Coins sent, transaction hash: ${tx.hash}`)
        } else {
            const token: IERC20 = IERC20__factory.connect(tokenContract, signer);

            console.log(`Attempting to send ${amount} of ${token.target} tokens from ${signer.address} to ${recipient}`);
            spinner.start();

            const tx = await token.transfer(recipient, amount);
            await tx.wait();

            spinner.stop();
            console.log(`Tokens sent, transaction hash: ${tx.hash}`)
        }
    })