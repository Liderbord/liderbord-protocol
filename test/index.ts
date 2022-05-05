import { expect } from "chai";
import { ethers } from "hardhat";
import { Liderbords__factory } from "../typechain";
import { Liderbords } from "../typechain/Liderbords";

describe("Liderbord", function () {
  let Liderbords: Liderbords__factory, liderbords: Liderbords;
  this.beforeEach(async () => {
    const address = await ethers.provider.getSigner().getAddress();
    Liderbords = await ethers.getContractFactory("Liderbords");
    liderbords = await Liderbords.deploy(address);
    await liderbords.deployed();

    const claimHappycoinsTX = await liderbords.claimHappycoins();
    await claimHappycoinsTX.wait();
    console.log(
      await (await liderbords.getHappycoins(address)).happycoins.toNumber()
    );
  });

  it("Should add a resource", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();
  });

  it("Should get the resources from a liderbord", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    const [links, scores] = await liderbords.getLiderbord("AI");

    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(0);
  });

  it("Should delete a resource", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    const [linksWithOneValue, scoresWithOneValue] =
      await liderbords.getLiderbord("AI");

    expect(linksWithOneValue).to.have.lengthOf(1);
    expect(scoresWithOneValue).to.have.lengthOf(1);
    expect(linksWithOneValue[0]).to.be.equal(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    expect(scoresWithOneValue[0]).to.be.equal(0);

    const deleteResourceTx = await liderbords.deleteResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    await deleteResourceTx.wait();

    const [linksWithZeroValues, scoresWithZeroValues] =
      await liderbords.getLiderbord("AI");

    expect(linksWithZeroValues).to.have.lengthOf(0);
    expect(scoresWithZeroValues).to.have.lengthOf(0);
  });

  it("Vote for a resources", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    const voteTx = await liderbords.vote(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "AI",
      1
    );
    await voteTx.wait();

    const [links, scores] = await liderbords.getLiderbord("AI");

    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(1);
  });

  it("Vote for a resource with a prohibited vote", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    await expect(
      liderbords.vote("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "AI", 3)
    ).to.be.revertedWith("Vote has to be either 1 or -1");

    const [links, scores] = await liderbords.getLiderbord("AI");

    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(0);
  });

  it("Get the resource from a link", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    const voteTx = await liderbords.vote(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "AI",
      1
    );
    await voteTx.wait();

    const vote1Tx = await liderbords.vote(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "Machine Learning",
      -1
    );
    await vote1Tx.wait();

    const [liderbordNames, scores] = await liderbords.getResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );

    expect(liderbordNames).to.have.length(2);
    expect(liderbordNames[0]).to.be.equal("Machine Learning");
    expect(liderbordNames[1]).to.be.equal("AI");

    expect(scores).to.have.length(2);
    expect(scores[0].downvotes).to.be.equal(1);
    expect(scores[1].upvotes).to.be.equal(1);

    console.log();
  });

  it("Vote same resource two times", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();

    const voteTx = await liderbords.vote(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "AI",
      -1
    );
    await voteTx.wait();

    const voteTx2 = await liderbords.vote(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "AI",
      1
    );
    await voteTx2.wait();

    const [links, scores] = await liderbords.getLiderbord("AI");

    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(1);
  });

  it("Vote different resources in the same liderbord", async function () {
    const setResourceTx = await liderbords.addResource(
      "https://www.youtube.com/",
      ["Machine Learning", "AI"]
    );
    await setResourceTx.wait();
    const setResourceTx2 = await liderbords.addResource(
      "https://www.github.com/",
      ["Machine Learning", "AI"]
    );
    await setResourceTx2.wait();

    const voteTx = await liderbords.vote("https://www.youtube.com/", "AI", -1);
    await voteTx.wait();

    const voteTx2 = await liderbords.vote("https://www.github.com/", "AI", 1);
    await voteTx2.wait();

    const [links, scores, upvotes, downvotes] = await liderbords.getLiderbord(
      "AI"
    );

    expect(links).to.have.lengthOf(2);
    expect(links[0]).to.be.equal("https://www.youtube.com/");
    expect(scores[0]).to.be.equal(0);
    expect(upvotes[0]).to.be.equal(0);
    expect(downvotes[0]).to.be.equal(0);
    expect(links[1]).to.be.equal("https://www.github.com/");
    expect(scores[1]).to.be.equal(1);
    expect(upvotes[1]).to.be.equal(1);
    expect(downvotes[1]).to.be.equal(0);
  });
});
