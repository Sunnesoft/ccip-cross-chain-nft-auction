import { expect } from "chai";
import { ethers } from "hardhat";
import { AbiCoder } from "ethers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TestToken, CrossChainVickreyAuction, CrossChainNFT, TestRouter } from "../typechain-types";
import { Client} from '../typechain-types/contracts/CrossChainVickreyAuction';
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers"

describe("CrossChainVickreyAuction in destination chain", function () {
	let owner: HardhatEthersSigner;
	let seller: HardhatEthersSigner;
	let buyers: HardhatEthersSigner[];

  let linkToken: TestToken;
  let linkTokenAddress: string;
  let destinationAuction: CrossChainVickreyAuction;
  let auctionAddress: string;
  let nft: CrossChainNFT;
  let nftTokenAddress: string;
  let router: TestRouter;
  let routerAddress: string;

  const nftTokenAddressSource = "0x0000000000000000000000000000000000000000";
  const tokenId: bigint = 1n;
  const startTime: bigint = BigInt(Math.round(Date.now() / 1000)+3600);
  const bidTime: bigint = startTime+3600n;
  const revealTime: bigint = bidTime+3600n;
  const replyTime: bigint = revealTime+3600n;
  const collateral: bigint = 1n;
  const souceChainSelector: bigint = 1n;
  const destinationChainSelector: bigint = 0n;
  const gasLimit = 500000;
  const strictMode = true;
  const totalSupply = 10 ** 9;
  const nftName = "CCNFT";
  const nftSymbol = "CCNFT";
  const linkName = "LINK";
  const linkSymbol = "LINK";
  const messageId = "0x626c756500000000000000000000000000000000000000000000000000000000";
  const nonce = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const createSignature = 0n;
  const mintNftSignature = 4n;
  const broadcastHighestBid = 5n;

  async function deployAuctionAndTokens() {
		[owner, seller, ...buyers] = await ethers.getSigners();

    linkToken = await ethers.deployContract("TestToken", [linkName, linkSymbol]);
    await linkToken.waitForDeployment();
    linkToken = linkToken.connect(owner);
    const tx = await linkToken.mint(owner, totalSupply);
    await tx.wait();

    router = await ethers.deployContract("TestRouter", []);
    await router.waitForDeployment();
    router = router.connect(owner);
    routerAddress = await router.getAddress();

    linkTokenAddress = await linkToken.getAddress();
    destinationAuction = await ethers.deployContract(
      "CrossChainVickreyAuction", 
      [owner.address, linkTokenAddress, destinationChainSelector, gasLimit, strictMode, linkTokenAddress]);
    await destinationAuction.waitForDeployment();
    destinationAuction = destinationAuction.connect(owner);

    auctionAddress = await destinationAuction.getAddress();

    const txSa = await destinationAuction.setAllowedChain(souceChainSelector, owner.address);
    await txSa.wait();

    nft = await ethers.deployContract("CrossChainNFT", [nftName, nftSymbol]);
    await nft.waitForDeployment();

    nftTokenAddress = await nft.getAddress();

    const txOwn = await nft.transferOwnership(auctionAddress);
    await txOwn.wait();
  }

  function encodeMsg(sign: bigint, msgData: string) : Client.Any2EVMMessageStruct {
    const coder = AbiCoder.defaultAbiCoder();

    const msg = coder.encode(
      ["uint256", "bytes"],
      [sign, msgData]
    );

    const message: Client.Any2EVMMessageStruct = {
      messageId: coder.encode(["bytes32"], [messageId]),
      sourceChainSelector: coder.encode(["uint64"], [souceChainSelector]),
      sender: coder.encode(["address"], [owner.address]),
      data: "0x0000000000000000000000000000000000000000000000000000000000000020" + msg.slice(2),
      destTokenAmounts: [],
    };

    return message
  }

  async function createAuction() {
    const coder = AbiCoder.defaultAbiCoder();
  
    const msgData = coder.encode(
      ["address", "uint256", "address", "uint32", "uint32", "uint32", "uint32", "address", "uint256"],
      [nftTokenAddressSource, tokenId, seller.address, startTime, bidTime, revealTime, replyTime, nftTokenAddress, collateral]
    );

    const tx = await destinationAuction.ccipReceive(encodeMsg(createSignature, msgData))
    await tx.wait();
  }

  async function bid(buyer: HardhatEthersSigner, bidValue: bigint) {
    const commitment = ethers.keccak256(AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address", "uint256", "uint32"],
      [nonce, bidValue, nftTokenAddress, tokenId, startTime]
    ));

    const buyerAddress = buyer.address;

    await linkToken.connect(owner).transfer(buyerAddress, bidValue);
    expect(await linkToken.balanceOf(buyerAddress)).to.equal(bidValue);

    await linkToken.connect(buyer).approve(auctionAddress, collateral);

    const tx = await destinationAuction.connect(buyer).bid(nftTokenAddress, tokenId, commitment);
    await tx.wait();
  }

  async function reveal(buyer: HardhatEthersSigner, bidValue: bigint) {
    await (await linkToken.connect(buyer).approve(auctionAddress, bidValue-collateral)).wait();
    await (await destinationAuction.connect(buyer).reveal(nftTokenAddress, tokenId, bidValue, nonce)).wait();
  }

	describe("Deployment", function () {

		it("Should assign the total supply of tokens to the owner", async function () {
      await loadFixture(deployAuctionAndTokens);

			const ownerBalance = await linkToken.balanceOf(owner.address);
			expect(await linkToken.totalSupply()).to.equal(ownerBalance);
		});
	});

  describe("Receive messages from source chain", function(){
    it("Should create new auction", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      const info = await destinationAuction.getAuctionInfo(nftTokenAddress, tokenId);

      const exp = [
        seller.address,
        souceChainSelector,
        startTime,
        bidTime,
        revealTime,
        replyTime,
        nftTokenAddress,
        collateral,
        0n,
        0n,
        nftTokenAddressSource,
        0n
      ];

      expect(info.toString()).to.equal(exp.toString());
    });

    it("Should mint new Nft in destination chain", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(replyTime + 5n);

      const coder = AbiCoder.defaultAbiCoder();
  
      const msgData = coder.encode(
        ["address", "uint256", "uint32", "string"],
        [nftTokenAddress, tokenId, startTime, "Hello world"]
      );
  
      const tx = await destinationAuction.ccipReceive(encodeMsg(mintNftSignature, msgData));
      await tx.wait();

      expect(await nft.balanceOf(auctionAddress)).to.equal(1n);
    });

    it("Should process results from source chain and unlock collaterals to withdraw", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);
      const bidValue = 5n;
      const buyer = buyers[0];
      await bid(buyer, bidValue);

      await time.increaseTo(bidTime + 5n);
      await reveal(buyer, bidValue);

      await time.increaseTo(replyTime + 5n);

      const coder = AbiCoder.defaultAbiCoder();
      const winner = buyers[1];
  
      const msgData = coder.encode(
        ["address", "uint256", "uint32", "address", "uint64"],
        [nftTokenAddress, tokenId, startTime, winner.address, souceChainSelector]
      );

      await (await destinationAuction.ccipReceive(encodeMsg(broadcastHighestBid, msgData))).wait();
      expect(await destinationAuction.isAuctionInit(nftTokenAddress, tokenId)).to.equal(false);

      await (await destinationAuction.connect(buyer).withdrawCollateral(nftTokenAddress, tokenId)).wait();
      expect(await linkToken.balanceOf(auctionAddress)).to.equal(0n);
      expect(await linkToken.balanceOf(buyer)).to.equal(bidValue);
    });

    it("Should finish auction after reply period and transfer winner payment to source chain", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);
      const bidValue = 5n;
      const buyer = buyers[0];
      await bid(buyer, bidValue);

      await time.increaseTo(bidTime + 5n);
      await reveal(buyer, bidValue);

      await time.increaseTo(replyTime + 5n);

      const coder = AbiCoder.defaultAbiCoder();
      const winner = buyer;
  
      await (await destinationAuction.ccipReceive(encodeMsg(broadcastHighestBid, coder.encode(
        ["address", "uint256", "uint32", "address", "uint64"],
        [nftTokenAddress, tokenId, startTime, winner.address, destinationChainSelector]
      )))).wait();
      expect(await destinationAuction.isAuctionInit(nftTokenAddress, tokenId)).to.equal(true);

      await (await destinationAuction.ccipReceive(encodeMsg(mintNftSignature, coder.encode(
        ["address", "uint256", "uint32", "string"],
        [nftTokenAddress, tokenId, startTime, "Hello world"]
      )))).wait();


      // TODO interraction with router
      // await (await destinationAuction.finish(nftTokenAddress, tokenId)).wait();

      // expect(await linkToken.balanceOf(auctionAddress)).to.equal(0n);
      // expect(await destinationAuction.isAuctionInit(nftTokenAddress, tokenId)).to.equal(false);
    });
  });

  describe("Auction logic", function() {
    it("Should make new bid", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);

      const bidValue = 5n;
      const buyer = buyers[0];
      await bid(buyer, bidValue);

      expect(await linkToken.balanceOf(auctionAddress)).to.equal(collateral);
      expect(await linkToken.balanceOf(buyer.address)).to.equal(bidValue - collateral);
    });

    it("Should reveal bid", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);

      const bidValue1 = 5n;
      const buyer1 = buyers[0];
      await bid(buyer1, bidValue1);

      const bidValue2 = 8n;
      const buyer2 = buyers[1];
      await bid(buyer2, bidValue2);

      await time.increaseTo(bidTime + 5n);

      await reveal(buyer1, bidValue1);
      await reveal(buyer2, bidValue2);

      const info = await destinationAuction.getAuctionInfo(nftTokenAddress, tokenId);
      expect(info.highestBidder).to.equal(buyer2.address);
    });

    it("Should withdraw second bid", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);

      const bidValue1 = 5n;
      const buyer1 = buyers[0];
      await bid(buyer1, bidValue1);

      const bidValue2 = 8n;
      const buyer2 = buyers[1];
      await bid(buyer2, bidValue2);

      await time.increaseTo(bidTime + 5n);

      await reveal(buyer1, bidValue1);
      await reveal(buyer2, bidValue2);

      await (await destinationAuction.connect(buyer1).withdrawCollateral(nftTokenAddress, tokenId)).wait();

      expect(await linkToken.balanceOf(auctionAddress)).to.equal(bidValue2);
      expect(await linkToken.balanceOf(buyer1)).to.equal(bidValue1);
    });
  });
});