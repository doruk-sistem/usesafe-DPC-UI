const { ethers } = require("hardhat");

async function main() {
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  console.log("Deploying ProductRegistry...");
  
  const productRegistry = await ProductRegistry.deploy();
  await productRegistry.deployed();
  
  console.log("ProductRegistry deployed to:", productRegistry.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 