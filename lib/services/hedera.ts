import {
  AccountId,
  PrivateKey,
  Client,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  Hbar,
  ContractId,
} from "@hashgraph/sdk";

export class HederaService {
  private static client: Client;
  private static contractId: ContractId;

  static initialize() {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK;
    const accountIdStr = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID;
    const privateKeyStr = process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY;

    // Convert Ethereum address to Hedera Contract ID
    const contractAddress = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_CONTRACT!;
    const contractIdString = contractAddress.replace("0x", "0.0.");
    this.contractId = ContractId.fromString(contractIdString);

    console.log("network", network);
    console.log("accountIdStr", accountIdStr);
    console.log("privateKeyStr", privateKeyStr);
    console.log("contractId", this.contractId);

    if (!network || !accountIdStr || !privateKeyStr || !this.contractId) {
      throw new Error(
        "Hedera environment variables are not properly configured."
      );
    }

    // Initialize Hedera client
    this.client = Client.forTestnet().setOperator(
      AccountId.fromString("0.0.5442115"),
      PrivateKey.fromStringECDSA(
        "1b41eadf206073acb0a1c789402b760e26ffcba2240fd57f0ac28552fc87327e"
      )
    );

    const accountId = AccountId.fromString(accountIdStr);
    const privateKey = PrivateKey.fromStringECDSA(privateKeyStr);

    if (network === "testnet") {
      this.client = Client.forTestnet();
    } else if (network === "mainnet") {
      this.client = Client.forMainnet();
    } else {
      throw new Error("Invalid Hedera network specified.");
    }

    this.client.setOperator(accountId, privateKey);
  }

  static async createProductOnBlockchain(
    productId: string,
    name: string,
    description: string,
    status: string
  ) {
    if (!this.client) this.initialize();

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(5000000) // Adjust gas as needed
        .setFunction(
          "createProduct",
          new ContractFunctionParameters()
            .addString(productId)
            .addString(name)
            .addString(description)
            .addString(status)
        );

      const execute = await transaction.execute(this.client);
      const receipt = await execute.getReceipt(this.client);

      console.log(`Hedera createProduct transaction status: ${receipt.status}`);
      return receipt.status.toString() === "SUCCESS";
    } catch (error) {
      console.error("Error creating product on Hedera:", error);
      throw error; // Re-throw to handle in calling function
    }
  }

  static async updateProductOnBlockchain(
    productId: string,
    name: string,
    description: string,
    status: string
  ) {
    if (!this.client) this.initialize();

    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          "updateProduct",
          new ContractFunctionParameters()
            .addString(productId)
            .addString(name)
            .addString(description)
            .addString(status)
        );

      const execute = await transaction.execute(this.client);
      const receipt = await execute.getReceipt(this.client);
      console.log(`Hedera updateProduct transaction status: ${receipt.status}`);
      return receipt.status.toString() === "SUCCESS";
    } catch (error) {
      console.error("Error updating product on Hedera:", error);
      throw error;
    }
  }

  static async getProductFromBlockchain(productId: string) {
    if (!this.client) this.initialize();

    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(50000) // Adjust gas limit as needed
        .setFunction(
          "getProduct",
          new ContractFunctionParameters().addString(productId)
        );

      const response = await query.execute(this.client);

      // Manually decode the response
      const result = {
        productId: response.getString(0),
        name: response.getString(1),
        description: response.getString(2),
        timestamp: response.getUint256(3),
        status: response.getString(4),
      };
      return result;
    } catch (error) {
      console.error("Error getting product from Hedera:", error);
      return null;
    }
  }
}
