const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // Create provider
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_HEDERA_RPC_URL
  );

  // Create wallet
  const wallet = new ethers.Wallet(process.env.HEDERA_PRIVATE_KEY, provider);

  // Get contract bytecode and ABI
  const contractJson = JSON.parse(
    fs.readFileSync("artifacts/contracts/ProductRegistry.sol/ProductRegistry.json")
  );

  // Create contract factory
  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    wallet
  );

  console.log("Deploying contract...");
  
  try {
    const contract = await factory.deploy();
    await contract.deployed();
    
    console.log("Contract deployed to:", contract.address);
    process.exit(0);
  } catch (error) {
    console.error("Error deploying contract:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 