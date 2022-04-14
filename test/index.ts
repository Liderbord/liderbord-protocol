import { expect } from "chai";
import { ethers } from "hardhat";

describe("Liderbord", function () {
  it("Should add a resource", async function () {
    const Liderbords = await ethers.getContractFactory("Liderbords");
    const liderbords = await Liderbords.deploy();
    await liderbords.deployed();

    const setResourceTx = await liderbords.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);

    await setResourceTx.wait();
  });

  it("Should get the resources from a liderbord", async function () {
    const Liderbords = await ethers.getContractFactory("Liderbords");
    const liderbords = await Liderbords.deploy();
    await liderbords.deployed();

    const setResourceTx = await liderbords.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);
    await setResourceTx.wait();

    const [links, scores] = await liderbords.getLiderbord("AI");
    
    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(0);
  });

  it("Should delete a resource", async function () {
    const Liderbords = await ethers.getContractFactory("Liderbords");
    const liderbords = await Liderbords.deploy();
    await liderbords.deployed();

    const setResourceTx = await liderbords.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);
    await setResourceTx.wait();

    const [linksWithOneValue, scoresWithOneValue] = await liderbords.getLiderbord("AI");
    
    expect(linksWithOneValue).to.have.lengthOf(1);
    expect(scoresWithOneValue).to.have.lengthOf(1);
    expect(linksWithOneValue[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scoresWithOneValue[0]).to.be.equal(0);

    const deleteResourceTx = await liderbords.deleteResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await deleteResourceTx.wait();

    const [linksWithZeroValues, scoresWithZeroValues] = await liderbords.getLiderbord("AI");
    
    expect(linksWithZeroValues).to.have.lengthOf(0);
    expect(scoresWithZeroValues).to.have.lengthOf(0);
  });

  it("Vote for a resources", async function () {
    const Liderbords = await ethers.getContractFactory("Liderbords");
    const liderbords = await Liderbords.deploy();
    await liderbords.deployed();

    const setResourceTx = await liderbords.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);
    await setResourceTx.wait();


    const voteTx = await liderbords.vote("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "AI", 1);
    await setResourceTx.wait();

    const [links, scores] = await liderbords.getLiderbord("AI");
    
    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(1);
  });
});
