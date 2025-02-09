import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  AccountId,
  PrivateKey,
  ContractId,
} from "@hashgraph/sdk";

class ProductBlockchainContractService {
  private static instance: ProductBlockchainContractService;
  private client: Client;
  private contractId: ContractId;

  private constructor() {
    console.log(process.env.HEDERA_ACCOUNT_ID);
    console.log(process.env.HEDERA_PRIVATE_KEY);

    // Initialize Hedera client
    this.client = Client.forTestnet().setOperator(
      AccountId.fromString("0.0.5442115"),
      PrivateKey.fromStringECDSA("1b41eadf206073acb0a1c789402b760e26ffcba2240fd57f0ac28552fc87327e")
    );

    // Convert Ethereum address to Hedera Contract ID
    const contractAddress = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_CONTRACT!;
    const contractIdString = contractAddress.replace("0x", "0.0.");
    this.contractId = ContractId.fromString(contractIdString);
  }

  public static getInstance(): ProductBlockchainContractService {
    if (!ProductBlockchainContractService.instance) {
      ProductBlockchainContractService.instance =
        new ProductBlockchainContractService();
    }
    return ProductBlockchainContractService.instance;
  }

  async createProduct(
    productId: string,
    name: string,
    manufacturer: string,
    description: string,
    productType: string,
    model: string
  ): Promise<string> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000)
        .setFunction(
          "createProduct",
          new ContractFunctionParameters()
            .addString(productId)
            .addString(name)
            .addString(manufacturer)
            .addString(description)
            .addString(productType)
            .addString(model)
        );

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      //Get the status of the transaction
      const statusContractCreateFlow = receipt.status;

      //Get the Transaction ID
      const txContractCreateId = txResponse.transactionId.toString();

      //Get the new contract ID
      const newContractId = receipt.contractId;

      console.log(
        "--------------------------------- Create Contract Flow ---------------------------------"
      );
      console.log(
        "Consensus status           :",
        statusContractCreateFlow.toString()
      );
      console.log("Transaction ID             :", txContractCreateId);
      console.log(
        "Hashscan URL               :",
        "https://hashscan.io/testnet/tx/" + txContractCreateId
      );
      console.log("Contract ID                :", newContractId);

      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error creating product on blockchain:", error);
      throw error;
    }
  }

  async updateProduct(
    productId: string,
    name: string,
    manufacturer: string,
    description: string,
    productType: string,
    model: string
  ): Promise<string> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000)
        .setFunction(
          "updateProduct",
          new ContractFunctionParameters()
            .addString(productId)
            .addString(name)
            .addString(manufacturer)
            .addString(description)
            .addString(productType)
            .addString(model)
        );

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error updating product on blockchain:", error);
      throw error;
    }
  }

  async getProduct(productId: string) {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          "getProduct",
          new ContractFunctionParameters().addString(productId)
        );

      const result = await query.execute(this.client);
      
      // Get individual values using the correct indices
      const createdAtTimestamp = result.getUint256(5);
      const updatedAtTimestamp = result.getUint256(6);

      // Convert BigInt timestamps to milliseconds and create Date objects
      const createdAtMs = BigInt(createdAtTimestamp.toString()) * BigInt(1000);
      const updatedAtMs = BigInt(updatedAtTimestamp.toString()) * BigInt(1000);

      return {
        name: result.getString(0),
        manufacturer: result.getString(1),
        description: result.getString(2),
        productType: result.getString(3),
        model: result.getString(4),
        createdAt: new Date(Number(createdAtMs)), // Convert back to number after calculations
        updatedAt: new Date(Number(updatedAtMs)), // Convert back to number after calculations
        isActive: result.getBool(7),
        owner: result.getAddress(8)
      };
    } catch (error) {
      console.error("Error getting product from blockchain:", error);
      throw error;
    }
  }

  async getManufacturerProducts(
    manufacturerAddress: string
  ): Promise<string[]> {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          "getManufacturerProducts",
          new ContractFunctionParameters().addAddress(manufacturerAddress)
        );

      const result = await query.execute(this.client);
      
      // Get array length and elements
      const length = result.getUint32(0);
      const products: string[] = [];
      
      for (let i = 0; i < length; i++) {
        products.push(result.getString(i + 1));
      }
      
      return products;
    } catch (error) {
      console.error("Error getting manufacturer products:", error);
      throw error;
    }
  }

  async deactivateProduct(productId: string): Promise<string> {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(1000000)
        .setFunction(
          "deactivateProduct",
          new ContractFunctionParameters().addString(productId)
        );

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error deactivating product:", error);
      throw error;
    }
  }
}

export const productBlockchainContractService =
  ProductBlockchainContractService.getInstance();
