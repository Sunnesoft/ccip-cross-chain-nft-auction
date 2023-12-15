import { expect } from "chai";
import { ethers } from "hardhat";
import { AbiCoder } from "ethers"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { TestToken, CrossChainVickreyAuction, CrossChainNFT } from "../typechain-types";
import { Client} from '../typechain-types/contracts/CrossChainVickreyAuction';
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers"

describe("CrossChainVickreyAuction in source chain", function () {
	let owner: HardhatEthersSigner;
	let seller: HardhatEthersSigner;
	let buyers: HardhatEthersSigner[];

  let linkToken: TestToken;
  let linkTokenAddress: string;
  let sourceAuction: CrossChainVickreyAuction;
  let auctionAddress: string;
  let nft: CrossChainNFT;
  let nftTokenAddress: string;

  const tokenId: bigint = 1n;
  const period = 3600n;
  const startTime: bigint = BigInt(Math.round(Date.now() / 1000))+4n*period;
  const bidTime: bigint = startTime+period;
  const revealTime: bigint = bidTime+period;
  const replyTime: bigint = revealTime+period;
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
  const applyHighestBid = 2n;

  async function deployAuctionAndTokens() {
		[owner, seller, ...buyers] = await ethers.getSigners();

    linkToken = await ethers.deployContract("TestToken", [linkName, linkSymbol]);
    await linkToken.waitForDeployment();
    linkToken = linkToken.connect(owner);
    const tx = await linkToken.mint(owner, totalSupply);
    await tx.wait();

    linkTokenAddress = await linkToken.getAddress();
    sourceAuction = await ethers.deployContract(
      "CrossChainVickreyAuction", 
      [owner.address, linkTokenAddress, souceChainSelector, gasLimit, strictMode, linkTokenAddress]);
    await sourceAuction.waitForDeployment();
    sourceAuction = sourceAuction.connect(owner);

    auctionAddress = await sourceAuction.getAddress();

    const txSa = await sourceAuction.setAllowedChain(destinationChainSelector, owner.address);
    await txSa.wait();

    nft = await ethers.deployContract("CrossChainNFT", [nftName, nftSymbol]);
    await nft.waitForDeployment();

    nft = nft.connect(owner);
    nftTokenAddress = await nft.getAddress();
  }

  function encodeMsg(sign: bigint, msgData: string) : Client.Any2EVMMessageStruct {
    const coder = AbiCoder.defaultAbiCoder();

    const msg = coder.encode(
      ["uint256", "bytes"],
      [sign, msgData]
    );

    const message: Client.Any2EVMMessageStruct = {
      messageId: coder.encode(["bytes32"], [messageId]),
      sourceChainSelector: coder.encode(["uint64"], [destinationChainSelector]),
      sender: coder.encode(["address"], [owner.address]),
      data: "0x0000000000000000000000000000000000000000000000000000000000000020" + msg.slice(2),
      destTokenAmounts: [],
    };

    return message
  }

  async function createAuction() {
    await nft.mint(seller.address, tokenId, "Hello, I'm new token!");
    await nft.connect(seller).approve(auctionAddress, tokenId);
    await (await sourceAuction.connect(seller)["create(address,uint256,uint32,uint32,uint32,uint32,uint256)"](
      nftTokenAddress,
      tokenId,
      startTime,
      period,
      period,
      period,
      collateral
    )).wait();
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

    const tx = await sourceAuction.connect(buyer).bid(nftTokenAddress, tokenId, commitment);
    await tx.wait();
  }

  async function reveal(buyer: HardhatEthersSigner, bidValue: bigint) {
    await (await linkToken.connect(buyer).approve(auctionAddress, bidValue-collateral)).wait();
    await (await sourceAuction.connect(buyer).reveal(nftTokenAddress, tokenId, bidValue, nonce)).wait();
  }

	describe("Deployment", function () {

		it("Should assign the total supply of tokens to the owner", async function () {
      await loadFixture(deployAuctionAndTokens);

			const ownerBalance = await linkToken.balanceOf(owner.address);
			expect(await linkToken.totalSupply()).to.equal(ownerBalance);
		});
	});

  describe("Receive messages from destination chain", function(){
    it("Should apply results from destination chain", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);
      const bidValue = 5n;
      const buyer = buyers[0];
      await bid(buyer, bidValue);

      await time.increaseTo(bidTime + 5n);
      await reveal(buyer, bidValue);

      await time.increaseTo(revealTime + 5n);

      const coder = AbiCoder.defaultAbiCoder();
      const winner = buyers[1];
  
      const msgData = coder.encode(
        ["address", "uint256", "uint32", "uint256", "uint256", "address"],
        [nftTokenAddress, tokenId, startTime, 3n*bidValue, 2n*bidValue, winner.address]
      );

      // TODO
      // await (await sourceAuction.ccipReceive(encodeMsg(applyHighestBid, msgData))).wait();
      
      // const info = await sourceAuction.getAuctionInfo(nftTokenAddress, tokenId);
      // expect(info.highestBidder).to.equal(winner.address);
      // expect(info.secondHighestBid).to.equal(2n*bidValue);
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

      const info = await sourceAuction.getAuctionInfo(nftTokenAddress, tokenId);
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

      await (await sourceAuction.connect(buyer1).withdrawCollateral(nftTokenAddress, tokenId)).wait();

      expect(await linkToken.balanceOf(auctionAddress)).to.equal(bidValue2);
      expect(await linkToken.balanceOf(buyer1)).to.equal(bidValue1);
    });

    it("Should finish auction after reply period and make exchange with 1 bid", async function() {
      await loadFixture(deployAuctionAndTokens);
      await loadFixture(createAuction);

      await time.increaseTo(startTime + 5n);
      const bidValue = 5n;
      const buyer = buyers[0];
      await bid(buyer, bidValue);

      await time.increaseTo(bidTime + 5n);
      await reveal(buyer, bidValue);

      await time.increaseTo(revealTime + 5n);

      const winner = buyer;

      await time.increaseTo(replyTime + 5n);
      await (await sourceAuction.finish(nftTokenAddress, tokenId)).wait();

      expect(await linkToken.balanceOf(auctionAddress), "LINK auction balance").to.equal(0n);
      expect(await linkToken.balanceOf(winner.address), "LINK winner balance").to.equal(0n);
      expect(await linkToken.balanceOf(seller.address), "LINK seller balance").to.equal(bidValue);
      expect(await nft.balanceOf(auctionAddress), "NFT auction balance").to.equal(0n);
      expect(await nft.balanceOf(winner.address), "NFT winner balance").to.equal(1n);
      expect(await nft.balanceOf(seller.address), "NFT seller balance").to.equal(0n);
      expect(await sourceAuction.isAuctionInit(nftTokenAddress, tokenId)).to.equal(false);
    });

    it("Should finish auction after reply period and make exchange with multiple bids", async function() {
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

      await time.increaseTo(revealTime + 5n);

      const winner = buyer2;
      const looser = buyer1;

      await time.increaseTo(replyTime + 5n);
      await (await sourceAuction.finish(nftTokenAddress, tokenId)).wait();

      expect(await linkToken.balanceOf(auctionAddress), "LINK auction balance").to.equal(bidValue1);
      expect(await linkToken.balanceOf(winner.address), "LINK winner balance").to.equal(bidValue2-bidValue1);
      expect(await linkToken.balanceOf(seller.address), "LINK seller balance").to.equal(bidValue1);
      expect(await nft.balanceOf(auctionAddress), "NFT auction balance").to.equal(0n);
      expect(await nft.balanceOf(winner.address), "NFT winner balance").to.equal(1n);
      expect(await nft.balanceOf(seller.address), "NFT seller balance").to.equal(0n);
      expect(await sourceAuction.isAuctionInit(nftTokenAddress, tokenId)).to.equal(false);

      await (await sourceAuction.connect(looser).withdrawCollateral(nftTokenAddress, tokenId)).wait();
      expect(await linkToken.balanceOf(auctionAddress), "LINK auction balance").to.equal(0n);
      expect(await linkToken.balanceOf(looser.address), "LINK auction balance").to.equal(bidValue1);
    });
  });
});