import { expect } from "chai";
import { ethers } from "hardhat";

describe("Liderbord", function () {
  it("Should add a resource", async function () {
    const Liderbord = await ethers.getContractFactory("Liderbord");
    const liderbord = await Liderbord.deploy();
    await liderbord.deployed();

    const setResourceTx = await liderbord.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);

    await setResourceTx.wait();
  });

  it("Should get the resources from a liderbord", async function () {
    const Liderbord = await ethers.getContractFactory("Liderbord");
    const liderbord = await Liderbord.deploy();
    await liderbord.deployed();

    const setResourceTx = await liderbord.addResource("https://www.youtube.com/watch?v=dQw4w9WgXcQ", ["Machine Learning", "AI"]);
    await setResourceTx.wait();

    const [links, scores] = await liderbord.getLiderbord("AI");
    
    expect(links).to.have.lengthOf(1);
    expect(links[0]).to.be.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(scores[0]).to.be.equal(0);
  });
});
