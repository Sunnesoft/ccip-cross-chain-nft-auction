
![](https://lh7-us.googleusercontent.com/cPS48Hv81986EfOb0ui6VmnM0HaFArao8c5MsBo-ZWeVFVb9UKIkYDYVLQgST3QOqwi6aOifxaZnr1ivlDpRuGPNBw7KoStPNwsquTaE4ssGbnp1kaRi3_gg29kF1KOmSdAaaA-MCtH07oZFK3Z-1LI)

**+xchange** or **CrossExchange** is the EVM crosschain auction protocol based on Chainlink [CCIP](https://docs.chain.link/ccip). This protocol was made as a project of "Constellation" Chainlink Hackathon (NOV 8 – DEC 10 2023). 

Inspired by [The Auction Zoo](https://github.com/a16z/auction-zoo/tree/main), the announcement of [UniswapX](https://blog.uniswap.org/uniswapx-protocol) and opportunities of Chainlink CCIP this protocol called upon to solve the problems of connectivity of seller's offers and needs of buyers of NFTs tokens. Currently, most NFTs are single-chain solutions and when the owner decides to swap it for another asset he can only do it within one chain (let's call it the source chain). It greatly narrows the market and creates additional risks for buyers. If the buyer hasn't got a token asset in the source chain but has this in another one (let's call it the destination chain) then he should use either a bridge (like CCIP, Polygon (POS) Bridge, Plasma, etc) or cryptocurrency exchange providers (like Binance, Kraken, etc). Anyway, he pays the platform extra commission, or should wait for some time while his assets are delivered to the source chain. During the waiting time, his asset is locked and in some cases, the seller may not wait and sell this NFT token to buyers who are ready to pay for it right now.    

## Solution

**+xchange** provides the sealed-bid second-price auction (Vickrey auction) Smart contract which is deployed to source and destination chains and can send and receive messages and tokens (ERC721 and ERC20) by the Chainlink CCIP protocol. The same auction contract is deployed in every EVM-compatible chain and provides the following functionality:
- Seller creates an auction in the chain where NFT (ERC721) token exists (source chain).
- Seller creates an auction in the chain where buyers who desire to buy this token (destination chain).
- Seller defines the minimum value of bid and collateral is the same for all bidders.
- Bidders submit written bids without knowing the bids of the other people in the auction.
- In every chain, the local winner is announced after bidders reveal the bid values.
- The results of the auction in every destination chain are replied to source chain auction for the definition of a global winner.
- The highest bidder from all chains wins but the price paid is the second-highest bid of all bids from all chains.    
- The global winner receives NFT tokens in his chain (destination chain) and sends payment (ERC20 cross-chain tokens) to seller chain (source chain).
- When the winner decide to sell this NFT token he also may create auction in his chain with the same functionallity and find the buyers from other chains.  

The core of the **+xchange** is CrossChainVickreyAuction.sol Solidity smart contract (all contracts you can find in ./contracts). For minting NFT on destination chain also CrossChainNFT.sol contract must be deployed in destination chain and the ownership must be transferred to corresponding contract. 

![](https://lh7-us.googleusercontent.com/o6o9hFCIp6ETLXDe8QWxeVZYmf5br9ZT8Bjc__H8DGgPzop8LJSct6IjncbqgOoBYpaPQEQFeOpkHjnrgYo3tt3kgeUU0MvVa7fIiqIX2zYGtIy4Qa_JjWPK5CkApmlBB9FbTo8SzWghD83x62DwFZQ)

The original contract is the contract inherited from IERC721URIStorage. The replica one is the CrossChainNFT contract also inherited from IERC721URIStorage and implemets mint() method.

## Timeline

![](https://lh7-us.googleusercontent.com/t2MrY8_Nv-91WThhGe62f8Mtw-n-KFydh7uMn5EIBTYCmj9FFHdcuUNneij8oV7ttw2Wmv7LkCx8ZRVTUG3lE8GOmvNRy1lSL7qvcaNPKTLA4vgvxB_hA5CkY3h8tckT-LyXwF8NVp_8UAJ9KK_a6po)


Current solution has some features:

- At start phase bidder pays only collateral value so nobody knows how much he really want to pay for the NFT token. But the collateral value must be enough to exclude inadequate hype and make seller confident that bidder intents to buy this token.
- All crosschain fees will be paid by msg.sender in native token.
- Although the protocol provides freedom of action for all interested parties, at each stage there are strict requirements for honest effort.
- Any tokens send btwn chains only at final step of auction.

So now you are quite immersed in the topic let's begin...

## Prerequisites

-   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
-   [Current LTS Node.js version](https://nodejs.org/en/about/releases/)
-   [Hardhat](https://hardhat.org/hardhat-runner/docs/getting-started#installation)
    
## Getting Started

1.  Install packages

    ```shell
    npm install
    ```

3.  Compile contracts
    
    ```shell
    npx hardhat compile
    ```

4.  Set up some environment variables.
    
- Set a password for encrypting and decrypting the environment variable file. You can change it later by typing the same command.
   
    ```shell
    npx env-enc set-pw
    ```

 - Now set the following environment variables: PRIVATE_KEY, Source Blockchain RPC URL, Destination Blockchain RPC URL. You can see available options in the .env.example file:

    ```shell
    PRIVATE_KEY=""
    ETHEREUM_SEPOLIA_RPC_URL=""
    OPTIMISM_GOERLI_RPC_URL=""
    ARBITRUM_TESTNET_RPC_URL=""
    AVALANCHE_FUJI_RPC_URL=""
    POLYGON_MUMBAI_RPC_URL=""
    ```

    To set these variables, type the following command and follow the instructions in the terminal:

    ```shell
    npx env-enc set
    ```

    After you are done, the .env.enc file will be automatically generated.

    If you want to validate your inputs you can always run the next command:

    ```shell
    npx env-enc view
    ```

4.  Run tests

    ```shell
    npx hardhat test
    ```

5.  Receive test tokens using any public faucet on the address which you are linked with your private key defined in 4 point. After balance is updated you may use project faucet for sending tokens to seller and buyers accounts:
    
    ```shell
    npx hardhat faucet 
        --blockchain NETWORK_ALIAS 
        --recipient RECIPIENT_ADDRESS 
        --amount AMOUNT  
        --token-contract TEST_TOKEN_ADDRESS # Optional
    ```
    where 
    
    - NETWORK_ALIAS must be one of [ethereumSepolia, polygonMumbai, optimismGoerli, arbitrumTestnet, avalancheFuji],
    - AMOUNT may be 1000000000000000 which is equal 0.001 ETH for empty --token-contract option and NETWORK_ALIAS == ethereumSepolia,
    - ADDRESS is a public address of the recipient,
    - TEST_TOKEN_ADDRESS is optional and may be any cross chain token ERC20 contract address.
  
6. Deploy the auction and nft contracts in the desired chains. The same contract will deploy to every network NETWORK_ALIAS. ROUTER_ADDRESS_IN_NETWORK will be taken from config or if defined explicitly then from command line arg.   
   
    ```shell
    npx hardhat deploy-auction 
        --router ROUTER_ADDRESS_IN_NETWORK #optional
        --network NETWORK_ALIAS 
        --token-address TOKEN_ADDRESS
        --gas-limit GAS_LIMIT 
        --strict STRICT_MODE 
        --source-chain-name SOURCE_NETWORK_ALIAS 
        --nft-name "Custom Nft (POS)" # Optional if nft contract already deployed
        --nft-symbol "CNFT" # Optional if nft contract already deployed
        --nft-token-contract NFT_TOKEN_CONTRACT_ADDRESS # Required if nft contract already deployed
    ```
    where 

    - TOKEN_ADDRESS is address of deployed cross chain ERC20 token, e.g. LINK token contract in polygonMumbai chain is 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
    - GAS_LIMIT is gas limit for crosschain message processing,
    - STRICT_MODE must be true or false [more here](https://docs.chain.link/ccip/best-practices),
    - SOURCE_NETWORK_ALIAS must be one of [ethereumSepolia, polygonMumbai, optimismGoerli, arbitrumTestnet, avalancheFuji] and if SOURCE_NETWORK_ALIAS != NETWORK_ALIAS then nft token ownership will be transfered to auction contract,
    
7. Mint test nft tokens  
        
    ```shell
    npx hardhat mint-nft-source 
        --source-blockchain NETWORK_ALIAS 
        --nft-token-contract NFT_TOKEN_CONTRACT_ADDRESS 
        --token-id ID 
        --token-uri URI
        --address RECIPIENT_ADDRESS
    
    ```

    where 

    - ID - tokenId value, number
    - URI - tokenUri value, string
    - RECIPIENT_ADDRESS - hex address of recipient account.

Perfect! Now you are ready for create your first auction.

## Usage

### Available tasks:

  - **balance-of-nft**                Gets the balance of CrossChainNFT for provided address
  - **bid**                           Set bid to CrossChainVickreyAuction.sol
  - **create-auction-destination**    Creates the new CrossChainVickreyAuction in destination network
  - **create-auction-source**         Creates the new CrossChainVickreyAuction in source network
  - **deploy-auction**                Deploys CrossChainNFT.sol and CrossChainVickreyAuction.sol smart contracts
  - **faucet**                        Transfers the provided amount of ERC20 token or native coin to the recipient
  - **finish**                        Finish the auction of CrossChainVickreyAuction.sol       
  - **get-approved-for-nft**              Gets approved address of CrossChainNFT
  - **get-auction-info**              Get CrossChainVickreyAuction information
  - **mint-nft-source**               Mint nft of CrossChainNFT.sol in source chain
  - **owner-of-nft**                  Gets the owner of CrossChainNFT for provided tokenId
  - **push-highest-bid-to**           Send auction highest bid to destination chain
  - **push-highest-bid-to-source**    Send auction highest bid to source chain
  - **reveal**                        Reveal the bid of CrossChainVickreyAuction.sol
  - **set-allowed-chain**             Add allowed chain to CrossChainVickreyAuction
  - **withdraw-collateral**           Withdraws collateral (in ERC20 tokens) from CrossChainVickreyAuction.sol

For getting the full list of tasks you should type

```shell
npx hardhat help
```

### Usecases

There is detailed example of crosschain auction workflow (ethereumSepolia, polygonMumbai).

Nft contract address in source chain is 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654. If you want to reproduce the whole workflow then follow instructions above. ERC20 token using for payment is LINK.

#### Deployment

- Let's deploy auction contract to ethereumSepolia network:

```shell
npx hardhat deploy-auction --network ethereumSepolia --token-address 0x779877A7B0D9E8603169DdbD7836e478b4624789 --gas-limit 500000 --strict true --source-chain-name ethereumSepolia --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654
```

Example of output:

```
Attempting to deploy CrossChainVickreyAuction smart contract on the ethereumSepolia blockchain using 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 address, with the Router address 0xd0daae2231e9cb96b94c8512223533293c3693bf provided as constructor argument
CrossChainVickreyAuction contract deployed at address 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 on the ethereumSepolia blockchain
```

- Let's deploy auction and nft contracs to polygonMumbai:

```shell
npx hardhat deploy-auction --network polygonMumbai --token-address 0x326C977E6efc84E512bB9C30f76E30c160eD06FB --gas-limit 500000 --strict true --source-chain-name ethereumSepolia --nft-name "Custom Nft (POS)" --nft-symbol "CNFT"
```

Example of output:

```
Attempting to deploy CrossChainVickreyAuction smart contract on the polygonMumbai blockchain using 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 address, with the Router address 0x70499c328e1e2a3c41108bd3730f6670a44595d1 provided as constructor argument
CrossChainVickreyAuction contract deployed at address 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 on the polygonMumbai blockchain
Attempting to deploy CrossChainNFT smart contract on the polygonMumbai blockchain using 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 address
CrossChainNFT contract deployed at address 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b on the polygonMumbai blockchain
Attempting to grant the minter role to the CrossChainVickreyAuction smart contract
CrossChainVickreyAuction can now mint CrossChainNFTs. Transaction hash: 0xcf569140000aa9eccce29fd9736d80e07b47382bb5fd6c34c100cefd6238d1dc
```

- We need to set permissions list of allowed chains for every auction contracts:


```shell
npx hardhat set-allowed-chain --source-blockchain polygonMumbai --destination-blockchain ethereumSepolia --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --receiver 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5

npx hardhat set-allowed-chain --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --receiver 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46
```

#### Auction creation

- Seller address is 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a. Lets mint new NFT token for him: 

```shell
npx hardhat mint-nft-source --source-blockchain ethereumSepolia --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --token-uri https://example.com/4 --address 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a
```

Tx hash: [0xbdbf84f805bce815510a48a6599051313fae2607f28d9955a675c1f5c608e49a](https://sepolia.etherscan.io/tx/0xbdbf84f805bce815510a48a6599051313fae2607f28d9955a675c1f5c608e49a)


- Now we are ready to create auction in the source chain:

```shell
npx hardhat create-auction-source --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --start-time 0 --bid-period 1200 --reveal-period 1200 --reply-period 1200 --collateral 1 --pk HERE_IS_PRIVATE_KEY
```

Tx hash: 0x5c1585f444a001de9337e9badbbcad9021b1c7a1f9d8654a14db0ed3366f93ea(https://sepolia.etherscan.io/tx/0x5c1585f444a001de9337e9badbbcad9021b1c7a1f9d8654a14db0ed3366f93ea)


- Let's create the aucion on polygonMumbai network:

```shell
npx hardhat create-auction-destination --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --source-nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --destination-nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --pk HERE_IS_PRIVATE_KEY --value 0.0005
```

Tx hash: [0xc3aab0d4c17f7076c05c8cb9e7a5e587002def2bccbebfd7bdc6fd7a4595a7ff](https://sepolia.etherscan.io/tx/0xc3aab0d4c17f7076c05c8cb9e7a5e587002def2bccbebfd7bdc6fd7a4595a7ff)

CCIP Message ID: [0x79b2a358db56dbfc083a1e5eef67b5230dc804cf2df8556a5ccca9fbdab9f8ca](https://ccip.chain.link/msg/0x79b2a358db56dbfc083a1e5eef67b5230dc804cf2df8556a5ccca9fbdab9f8ca)


- Let's get information about auction from ethereumSepolia chain:

```shell
npx hardhat get-auction-info --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4
```

Example of output:

```
Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the ethereumSepolia from 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 account
getAuctionInfo request sent, response: 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a,16015286601757825753,1702257840,1702259040,1702260240,1702261440,0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654,1,0,0,0x0000000000000000000000000000000000000000,0
```

- Let's get information about auction from polygonMumbai chain:

```shell
npx hardhat get-auction-info --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4
```

Example of output:

```
Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the polygonMumbai from 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 account
getAuctionInfo request sent, response: 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a,16015286601757825753,1702257840,1702259040,1702260240,1702261440,0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b,1,0,0,0x0000000000000000000000000000000000000000,0
```

#### Bidding

- First bidder (0x2A0CC2B5286Ebe0ff276B5593d6471f254325063) will make bid to polygonMumbai. Lets increase LINK and MATIC balances for this account.

```shell
npx hardhat faucet --blockchain polygonMumbai --recipient 0x2A0CC2B5286Ebe0ff276B5593d6471f254325063 --amount 1000000000000000

npx hardhat faucet --blockchain polygonMumbai --recipient 0x2A0CC2B5286Ebe0ff276B5593d6471f254325063 --amount 10000000000000000000 --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
```

Tx hash: [0x2b084d114b7d37fe2801a559581cdc528571bd0e777e4047ad069b339dd36951](https://mumbai.polygonscan.com/tx/0x2b084d114b7d37fe2801a559581cdc528571bd0e777e4047ad069b339dd36951)

Tx hash: [0xe37c0caf69337f564c88e3faeec4e6f829a5cff90a599b7c9ae522b4fd225a1b](https://mumbai.polygonscan.com/tx/0xe37c0caf69337f564c88e3faeec4e6f829a5cff90a599b7c9ae522b4fd225a1b)

- Do the same for bidders 0x6d8d2E18c03364516abDE76915A5453A26fe8D53 in polygonMumbai and for 0xc825b4b6C22428De58a88f3E032C193a77D35071, 0x922eA37Ed75e180006424755C21Aa2a3FDFd4bEA in ethereumSepolia networks.

For 0x6d8d2E18c03364516abDE76915A5453A26fe8D53:

Tx hash: [0x2c85d9e3c67c30893a2b07c4be0535d7f52ba76224eadc9acc2c79be2a60c629](https://mumbai.polygonscan.com/tx/0x2c85d9e3c67c30893a2b07c4be0535d7f52ba76224eadc9acc2c79be2a60c629)

Tx hash: [0x8855687b57891e48c1207d10731880690b1316186aaddec75b5462f0d092dba0](https://mumbai.polygonscan.com/tx/0x8855687b57891e48c1207d10731880690b1316186aaddec75b5462f0d092dba0)

For 0xc825b4b6C22428De58a88f3E032C193a77D35071:

Tx hash: [0x4b7e6ed07adce5d6568c4d6c60f523736f198c605b8a7a42e75397809d9bc266](https://sepolia.etherscan.io/tx/0x4b7e6ed07adce5d6568c4d6c60f523736f198c605b8a7a42e75397809d9bc266)

Tx hash: [0x25c5f0e617027cd2893d5730936fca411bbc2958c8c3ad6d585246d4173eb14f](https://sepolia.etherscan.io/tx/0x25c5f0e617027cd2893d5730936fca411bbc2958c8c3ad6d585246d4173eb14f)

For 0x922eA37Ed75e180006424755C21Aa2a3FDFd4bEA:

Tx hash: [0x1044642a646cb77cefb247cdd2e84fc1b8dcc5add9e1af602fb2fec860699eb8](https://sepolia.etherscan.io/tx/0x1044642a646cb77cefb247cdd2e84fc1b8dcc5add9e1af602fb2fec860699eb8)

Tx hash: [0xd12ad978a1e6888236ae1e03876f844f3595232a897e075e5c75968ba270b225](https://sepolia.etherscan.io/tx/0xd12ad978a1e6888236ae1e03876f844f3595232a897e075e5c75968ba270b225)


- Let's make the first bids

```shell
npx hardhat bid --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000001 --pk HERE_IS_PRIVATE_KEY --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat bid --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --bid-value 4 --nonce 0x0000000000000000000000000000000000000000000000000000000000000005 --pk HERE_IS_PRIVATE_KEY --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat bid --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --bid-value 2 --nonce 0x0000000000000000000000000000000000000000000000000000000000000003 --pk HERE_IS_PRIVATE_KEY --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789 

npx hardhat bid --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000008 --pk HERE_IS_PRIVATE_KEY --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789  
```

Tx hash: [0x52e8de47a8e9bcbf083a58478b7dc4ad42e764c6eb644be0d3fc3de33d8a7d98](https://mumbai.polygonscan.com/tx/0x52e8de47a8e9bcbf083a58478b7dc4ad42e764c6eb644be0d3fc3de33d8a7d98)

Tx hash: [0x9b2898f71d8371934d99f17af4a032a9e3dc7af3ba140647d10fc6d60fbf1c04](https://mumbai.polygonscan.com/tx/0x9b2898f71d8371934d99f17af4a032a9e3dc7af3ba140647d10fc6d60fbf1c04)

Tx hash: [0x02124be758e9902fc37e9ce0cb823fb17c2ba3cdc41bae887806c79909fc61c1](https://sepolia.etherscan.io/tx/0x02124be758e9902fc37e9ce0cb823fb17c2ba3cdc41bae887806c79909fc61c1)

Tx hash: [0x81a48afad3b33f43e70ae4ac51fbf8d5dd791cf609c9036c733de113f5e27268](https://sepolia.etherscan.io/tx/0x81a48afad3b33f43e70ae4ac51fbf8d5dd791cf609c9036c733de113f5e27268)


#### Reveal selead bids

```shell
npx hardhat reveal --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000001 --pk HERE_IS_PRIVATE_KEY --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB 

npx hardhat reveal --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --bid-value 4 --nonce 0x0000000000000000000000000000000000000000000000000000000000000005 --pk HERE_IS_PRIVATE_KEY --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat reveal --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --bid-value 2 --nonce 0x0000000000000000000000000000000000000000000000000000000000000003 --pk HERE_IS_PRIVATE_KEY --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789   

npx hardhat reveal --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000008 --pk HERE_IS_PRIVATE_KEY --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789    
```

Tx hash: [0xdf342052cbfc42c65443564ec431148889836f1371972758f31632369a916c96](https://mumbai.polygonscan.com/tx/0xdf342052cbfc42c65443564ec431148889836f1371972758f31632369a916c96)

Tx hash: [0xd7ab7ccc94cb1e67654559a234ac80123124299bc1b2c482cba03be4b6ef06bc](https://mumbai.polygonscan.com/tx/0xd7ab7ccc94cb1e67654559a234ac80123124299bc1b2c482cba03be4b6ef06bc)

Tx hash: [0x5c07c6098313eb1c67214dbc9d40fe8f21ad5522cbd017d0fd48346e6877153a](https://sepolia.etherscan.io/tx/0x5c07c6098313eb1c67214dbc9d40fe8f21ad5522cbd017d0fd48346e6877153a)

Tx hash: [0x3c7ad80909ab052ec23e7cd4a1f735e322906af716bbd7eb8e09b39725dad7fa](https://sepolia.etherscan.io/tx/0x3c7ad80909ab052ec23e7cd4a1f735e322906af716bbd7eb8e09b39725dad7fa)

- Do you want to be sure that local winner is defined correctly? Me too! So lets do it:

```shell
npx hardhat get-auction-info --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4

npx hardhat get-auction-info --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4
```

The first expretion returns that the winner is 0x922eA37Ed75e180006424755C21Aa2a3FDFd4bEA with highest bid 3 for ethereumSepolia auction. The second one returns that the winner is 0x6d8d2E18c03364516abDE76915A5453A26fe8D53 with the highest bid 4 for polygonMumbai auction. Thats true)


#### Reply phase

```shell
npx hardhat push-highest-bid-to-source --blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --pk HERE_IS_PRIVATE_KEY --value 0.0005
```


#### Final phase

- Let's notify destination auction about global state changes (for the future releases this stage will be modified and only 'loser' chains need to be notified):

```shell
npx hardhat push-highest-bid-to --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --pk HERE_IS_PRIVATE_KEY --value 0.0005
```


- Let's finilaze the auction item state for source chain:

```shell
npx hardhat finish --source-blockchain ethereumSepolia --auction-contract 0x21B93cf747643CCCfB505905a4cD7672eEE0dFB5 --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 4 --pk HERE_IS_PRIVATE_KEY --value 0.0005
```


- When NFT will be minted in destination chain we can finalize the auction item state for destination chain:

```shell
npx hardhat finish --source-blockchain polygonMumbai --auction-contract 0x0e99dCb7e3Bc6ECcee3168D10046ECBf8cB77b46 --nft-token-contract 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --token-id 4 --pk HERE_IS_PRIVATE_KEY --value 0.0005
```


- Lets check that buyer received his NFT and seller received tokens:

```shell
npx hardhat owner-of-nft --nft 0x0B5f1479F08f6C1C2355879EA52c622a8b1Fc84b --blockchain polygonMumbai --token-id 4
```

And according to seller balance increased by 3 LINK (the value of second highest bid).


### Ways of project development

- increase cost efficacy,
- increase reliance and fault tolerance,
- implement the different auction strategies including Dutch auction,
- simplification of the protocol.


### Disclaimer

These smart contracts are being provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the user interface or the smart contracts. They have not been audited and as such there can be no assurance they will work as intended, and users may experience delays, failures, errors, omissions or loss of transmitted information. THE SMART CONTRACTS CONTAINED HEREIN ARE FURNISHED AS IS, WHERE IS, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTY OF MERCHANTABILITY, NON- INFRINGEMENT OR FITNESS FOR ANY PARTICULAR PURPOSE. IT IS JUST A PROTOTYPE. DO NOT USE IT IN THE PRODUCTION.

