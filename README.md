
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
CrossChainVickreyAuction contract deployed at address 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c on the ethereumSepolia blockchain
```

- Let's deploy auction and nft contracs to polygonMumbai:

```shell
npx hardhat deploy-auction --network polygonMumbai --token-address 0x326C977E6efc84E512bB9C30f76E30c160eD06FB --gas-limit 500000 --strict true --source-chain-name ethereumSepolia --nft-name "Custom Nft (POS)" --nft-symbol "CNFT"
```

Example of output:

```
Attempting to deploy CrossChainVickreyAuction smart contract on the polygonMumbai blockchain using 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 address, with the Router address 0x70499c328e1e2a3c41108bd3730f6670a44595d1 provided as constructor argument
CrossChainVickreyAuction contract deployed at address 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f on the polygonMumbai blockchain
Attempting to deploy CrossChainNFT smart contract on the polygonMumbai blockchain using 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 address
CrossChainNFT contract deployed at address 0xB744673b51746340b3e94F01596e5242C614098C on the polygonMumbai blockchain
Attempting to grant the minter role to the CrossChainVickreyAuction smart contract
CrossChainVickreyAuction can now mint CrossChainNFTs. Transaction hash: 0x5291df572db767ad437ca779453fde534c007b2f4b6e23695830510191420c09
```

- We need to set permissions list of allowed chains for every auction contracts:


```shell
npx hardhat set-allowed-chain --source-blockchain polygonMumbai --destination-blockchain ethereumSepolia --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --receiver 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c

npx hardhat set-allowed-chain --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --receiver 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f
```

#### Auction creation

- Seller address is 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a. Lets mint new NFT token for him: 

```shell
npx hardhat mint-nft-source --source-blockchain ethereumSepolia --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --token-uri https://example.com/159 --address 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a
```

Tx hash: [0x0ea66c42148bc7e566620970a362f9cfa77b725f323c5d0f0ecebe7c01712ddc](https://sepolia.etherscan.io/tx/0x0ea66c42148bc7e566620970a362f9cfa77b725f323c5d0f0ecebe7c01712ddc)


- Now we are ready to create auction in the source chain:

```shell
npx hardhat create-auction-source --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --start-time 0 --bid-period 3600 --reveal-period 3600 --reply-period 3600 --collateral 1 --pk PRIVATE_KEY_HERE
```

Tx hash: 0x5bd1dd7f8f07ca646089a9d1f59d99177d857248797f01c8b9c228daf60c085b(https://sepolia.etherscan.io/tx/0x5bd1dd7f8f07ca646089a9d1f59d99177d857248797f01c8b9c228daf60c085b)


- Let's create the aucion on polygonMumbai network:

```shell
npx hardhat create-auction-destination --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --source-nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --destination-nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --pk PRIVATE_KEY_HERE --value 0.5
```

Tx hash: [0xadf501daa34d539668899ccf3ba5add4fe5ab14ce4b8310f7c96bd5d5726dacc](https://sepolia.etherscan.io/tx/0xadf501daa34d539668899ccf3ba5add4fe5ab14ce4b8310f7c96bd5d5726dacc)

CCIP Message ID: [0xd51040a2eaf3b9093dc150bfc0d13a398fe14940bf8fcbcfbb2d7066e7bb429b](https://ccip.chain.link/msg/0xd51040a2eaf3b9093dc150bfc0d13a398fe14940bf8fcbcfbb2d7066e7bb429b)


- Let's get information about auction from ethereumSepolia chain:

```shell
npx hardhat get-auction-info --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159
```

Example of output:

```
Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the ethereumSepolia from 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 account
getAuctionInfo request sent, response: 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a,16015286601757825753,1702585584,1702589184,1702592784,1702596384,0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654,1,0,0,0x0000000000000000000000000000000000000000,0
```

- Let's get information about auction from polygonMumbai chain:

```shell
npx hardhat get-auction-info --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159
```

Example of output:

```
Attempting to call the getAuctionInfo function of the CrossChainVickreyAuction.sol smart contract on the polygonMumbai from 0x8d6D925eDF2C84E99Ffa7F279865c75FCD858809 account
getAuctionInfo request sent, response: 0x3c7aB2bcC615cf98f75AF6b446D35bE1A404754a,16015286601757825753,1702585584,1702589184,1702592784,1702596384,0xB744673b51746340b3e94F01596e5242C614098C,1,0,0,0x0000000000000000000000000000000000000000,0
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
npx hardhat bid --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000001 --pk PRIVATE_KEY_HERE --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat bid --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --bid-value 4 --nonce 0x0000000000000000000000000000000000000000000000000000000000000005 --pk PRIVATE_KEY_HERE --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat bid --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --bid-value 2 --nonce 0x0000000000000000000000000000000000000000000000000000000000000003 --pk PRIVATE_KEY_HERE --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789 

npx hardhat bid --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000008 --pk PRIVATE_KEY_HERE --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789  
```

Tx hash: [0xbdcb775ee6c9261d2a49dd4e639b958e5fb7106df96cd075ee8ea798ad4027f5](https://mumbai.polygonscan.com/tx/0xbdcb775ee6c9261d2a49dd4e639b958e5fb7106df96cd075ee8ea798ad4027f5)

Tx hash: [0x8bca66822b04dc63ede8519fd64fbbca960ccaaf206f17eb24f5ba629537fe2f](https://mumbai.polygonscan.com/tx/0x8bca66822b04dc63ede8519fd64fbbca960ccaaf206f17eb24f5ba629537fe2f)

Tx hash: [0xdc23c1b3b0ed6e57791e24168d5e72c634af175571f6506291c41b6d4c752f24](https://sepolia.etherscan.io/tx/0xdc23c1b3b0ed6e57791e24168d5e72c634af175571f6506291c41b6d4c752f24)

Tx hash: [0x7c736246dd616ceda61106ff5995754836c27a766502ad96d75a14a8f5a95fb0](https://sepolia.etherscan.io/tx/0x7c736246dd616ceda61106ff5995754836c27a766502ad96d75a14a8f5a95fb0)


#### Reveal selead bids

```shell
npx hardhat reveal --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000001 --pk PRIVATE_KEY_HERE --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB 

npx hardhat reveal --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --bid-value 4 --nonce 0x0000000000000000000000000000000000000000000000000000000000000005 --pk PRIVATE_KEY_HERE --token-contract 0x326C977E6efc84E512bB9C30f76E30c160eD06FB

npx hardhat reveal --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --bid-value 2 --nonce 0x0000000000000000000000000000000000000000000000000000000000000003 --pk PRIVATE_KEY_HERE --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789   

npx hardhat reveal --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --bid-value 3 --nonce 0x0000000000000000000000000000000000000000000000000000000000000008 --pk PRIVATE_KEY_HERE --token-contract 0x779877A7B0D9E8603169DdbD7836e478b4624789    
```

Tx hash: [0xa2258512cc04ca4812e75fad37a269f1551b3e7e717333a99e5c6e68df050f21](https://mumbai.polygonscan.com/tx/0xa2258512cc04ca4812e75fad37a269f1551b3e7e717333a99e5c6e68df050f21)

Tx hash: [0x04642c60ca0bdff767fcfdded5cad1b12aafd7bf47bb39b78a27f589f606fee8](https://mumbai.polygonscan.com/tx/0x04642c60ca0bdff767fcfdded5cad1b12aafd7bf47bb39b78a27f589f606fee8)

Tx hash: [0xf72ed924be52e6934aa7e1c1ec52e83cb895c3ac6dcf955c41955ce693c75e85](https://sepolia.etherscan.io/tx/0xf72ed924be52e6934aa7e1c1ec52e83cb895c3ac6dcf955c41955ce693c75e85)

Tx hash: [0x3a36169266760c69564673e1e6764d4927b7ffdbfa0e776dce62ed6e0ac253a1](https://sepolia.etherscan.io/tx/0x3a36169266760c69564673e1e6764d4927b7ffdbfa0e776dce62ed6e0ac253a1)

- Do you want to be sure that local winner is defined correctly? Me too! So lets do it:

```shell
npx hardhat get-auction-info --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159

npx hardhat get-auction-info --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159
```

The first expretion returns that the winner is 0x922eA37Ed75e180006424755C21Aa2a3FDFd4bEA with highest bid 3 for ethereumSepolia auction. The second one returns that the winner is 0x6d8d2E18c03364516abDE76915A5453A26fe8D53 with the highest bid 4 for polygonMumbai auction. Thats true)


#### Reply phase

```shell
npx hardhat push-highest-bid-to-source --blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --pk PRIVATE_KEY_HERE --value 5
```

Tx hash: [0xce01bb9725f0d8035984fb66cf0cbb14a302431e7fa29f74f4645b6b66ba1f5an](https://mumbai.polygonscan.com/tx/0xce01bb9725f0d8035984fb66cf0cbb14a302431e7fa29f74f4645b6b66ba1f5a)

CCIP Message ID: [0x8546f5ff068e19a176f2dde510c42fe158022dbe0b45e63d7631c69b350ecad0](https://ccip.chain.link/msg/0x8546f5ff068e19a176f2dde510c42fe158022dbe0b45e63d7631c69b350ecad0)


#### Final phase

- Let's notify destination auction about global state changes:

```shell
npx hardhat push-highest-bid-to --source-blockchain ethereumSepolia --destination-blockchain polygonMumbai --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --pk PRIVATE_KEY_HERE --value 0.5
```

Tx hash: [0x57e493d92b3a028d01562a4aff6a288b9388dc9d8d33be210b973ecdda4aa2e1](https://sepolia.etherscan.io/tx/0x57e493d92b3a028d01562a4aff6a288b9388dc9d8d33be210b973ecdda4aa2e1)

CCIP Message ID: [0xeba0e95426ad6477fda12db9071967c9b77c3dee2207aca3f13a9c18b6adb871](https://ccip.chain.link/msg/0xeba0e95426ad6477fda12db9071967c9b77c3dee2207aca3f13a9c18b6adb871)


- Let's finilaze the auction item state for source chain:

```shell
npx hardhat finish --source-blockchain ethereumSepolia --auction-contract 0x7bCc58752acf6B6E185E8bBF4b19F31C9Ce31e6c --nft-token-contract 0x2cC1FB8e4bcE424838a3Ec6B5993A6ecc7EE7654 --token-id 159 --pk PRIVATE_KEY_HERE --value 0.5
```

Tx hash: [0x696916ebf22e496ba5a61ddce585b105b33d514e2d9b4d873c4ea2da821603eb](https://sepolia.etherscan.io/tx/0x696916ebf22e496ba5a61ddce585b105b33d514e2d9b4d873c4ea2da821603eb)

CCIP Message ID: [0xdb15769d3b8d1e82cd103c96298e893479e28f3ffda5b31471c64700135d5f28](https://ccip.chain.link/msg/0xdb15769d3b8d1e82cd103c96298e893479e28f3ffda5b31471c64700135d5f28)


- When NFT will be minted in destination chain we can finalize the auction item state for destination chain:

```shell
npx hardhat finish --source-blockchain polygonMumbai --auction-contract 0xD67306b0bCdcf039E418e98f3999fa4D786d9D6f --nft-token-contract 0xB744673b51746340b3e94F01596e5242C614098C --token-id 159 --pk PRIVATE_KEY_HERE --value 0.5
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



