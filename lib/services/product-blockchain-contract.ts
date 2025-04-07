import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  AccountId,
  PrivateKey,
  ContractId,
  Hbar,
} from "@hashgraph/sdk";

class ProductBlockchainContractService {
  private static instance: ProductBlockchainContractService;
  private client: Client;
  private contractId: ContractId;

  private constructor() {
    // Get operator credentials from environment variables
    const operatorId = process.env.HEDERA_ACCOUNT_ID || "0.0.5442115";
    const operatorKey = process.env.HEDERA_PRIVATE_KEY || 
      "1b41eadf206073acb0a1c789402b760e26ffcba2240fd57f0ac28552fc87327e";

    try {
      // Initialize Hedera client
      this.client = Client.forTestnet().setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromStringECDSA(operatorKey)
      );

      // Set max retry/timeout parameters to help with browser environment limitations
      this.client.setMaxNodeAttempts(5);
      this.client.setRequestTimeout(15000); // 15 seconds timeout

      // Convert Ethereum address to Hedera Contract ID
      const contractAddress = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_CONTRACT!;
      const contractIdString = contractAddress.replace("0x", "0.0.");
      this.contractId = ContractId.fromString(contractIdString);
    } catch (error) {
      console.error("Error initializing Hedera client:", error);
      throw error;
    }
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
      // Add more robust error handling and input validation
      if (!productId || !name || !manufacturer) {
        throw new Error("Required product fields are missing");
      }

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

      //Get the Transaction ID
      const txContractCreateId = txResponse.transactionId.toString();

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

      // Set a default max payment for the query
      query.setMaxQueryPayment(new Hbar(2));

      let result;
      try {
        // Try to get the cost estimate and set query payment
        const cost = await query.getCost(this.client);
        result = await query.setQueryPayment(cost).execute(this.client);
      } catch (costError) {
        console.warn("Failed to get cost estimate, using default payment:", costError);
        // If cost calculation fails, set a fixed payment amount and execute
        result = await query.setQueryPayment(new Hbar(1)).execute(this.client);
      }
      
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
