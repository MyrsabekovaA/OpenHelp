const { ethers } = require("hardhat");


async function main() {
    const Donation = await ethers.getContractFactory("DonationPlatform");
    const donation = await Donation.deploy();
    await donation.deployed();

    console.log("✅ Contract deployed at:", donation.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });