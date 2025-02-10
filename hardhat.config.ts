import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hedera_testnet: {
      url: process.env.NEXT_PUBLIC_HEDERA_RPC_URL || "https://testnet.hashio.io/api",
      accounts: [process.env.HEDERA_PRIVATE_KEY!],
      chainId: 296
    }
  }
};

export default config; 