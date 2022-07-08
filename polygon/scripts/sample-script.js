// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy

  //   const STTToken = await hre.ethers.getContractFactory("STTToken");
  //   const sttToken = await STTToken.deploy(1000000);
  //   await sttToken.deployed();
  //   console.log("STT deployed to:", sttToken.address);
  //   fs.writeFileSync('./stt-contract.js', `
  // export const marketplaceAddress = "${sttToken.address}"
  // `)

    const Agent = await hre.ethers.getContractFactory("Agent");
    const agent = await Agent.deploy("0xEF9083f7d3C995Fc95f9F296b1A30E7BdeD2206D");
    await agent.deployed();
    console.log("Agent deployed to:", agent.address);
    fs.writeFileSync('./agent-contract.js', `
  export const marketplaceAddress = "${agent.address}"
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
