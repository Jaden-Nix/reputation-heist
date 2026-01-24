const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Address of the "Heist Master" (Server Oracle)
    // For now, we can set it to the deployer's address or a specific backend wallet.
    // Ideally this should be an env var or the deployer itself for testing.
    const heistMasterAddress = deployer.address;

    const BaseHeist = await hre.ethers.getContractFactory("BaseHeist");
    const baseHeist = await BaseHeist.deploy(heistMasterAddress);

    await baseHeist.waitForDeployment();

    console.log("BaseHeist deployed to:", await baseHeist.getAddress());
    console.log("Heist Master set to:", heistMasterAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
