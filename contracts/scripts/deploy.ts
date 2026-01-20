import hre from "hardhat";
const { ethers } = hre;

async function main() {
    console.log("Deploying HeistManager...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // For Hackathon/Demo: Deployer is HeistMaster, Treasury, and Community Pool
    const HEIST_MASTER = deployer.address;
    const TREASURY = deployer.address;
    const COMMUNITY_POOL = deployer.address;

    const HeistManager = await ethers.getContractFactory("HeistManager");
    const heist = await HeistManager.deploy(HEIST_MASTER, TREASURY, COMMUNITY_POOL);

    await heist.waitForDeployment();

    const address = await heist.getAddress();
    console.log(`HeistManager deployed to: ${address}`);
    console.log("Verify with:");
    console.log(`npx hardhat verify --network base-sepolia ${address} ${HEIST_MASTER} ${TREASURY} ${COMMUNITY_POOL}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
