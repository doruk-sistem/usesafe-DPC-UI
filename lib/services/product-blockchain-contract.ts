import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  AccountId,
  PrivateKey,
  ContractId,
  ContractCreateFlow,
} from "@hashgraph/sdk";

import contractData from '../contracts/ProductRegistry.json';

class ProductBlockchainContractService {
  private static instance: ProductBlockchainContractService;
  private client: Client;
  private contractBytecode: string;

  private constructor() {
    console.log("Initializing ProductBlockchainContractService...");

    // Initialize Hedera client
    this.client = Client.forTestnet().setOperator(
      AccountId.fromString("0.0.5442115"),
      PrivateKey.fromStringECDSA(
        "1b41eadf206073acb0a1c789402b760e26ffcba2240fd57f0ac28552fc87327e"
      )
    );

    // Contract bytecode'u JSON'dan al
    this.contractBytecode = contractData.bytecode;

    console.log("Contract bytecode length:", this.contractBytecode?.length);
    
    if (!this.contractBytecode || this.contractBytecode.length < 100) {
      throw new Error("Invalid contract bytecode");
    }
    
    console.log("Service initialized successfully");
  }

  public static getInstance(): ProductBlockchainContractService {
    if (!ProductBlockchainContractService.instance) {
      ProductBlockchainContractService.instance =
        new ProductBlockchainContractService();
    }
    return ProductBlockchainContractService.instance;
  }

  private async deployNewContract(): Promise<ContractId> {
    try {
      console.log("Starting contract deployment...");
      console.log("Bytecode length:", this.contractBytecode.length);

      // Create a file on Hedera containing the contract bytecode
      const contractCreate = new ContractCreateFlow()
        .setGas(3000000)
        .setBytecode(this.contractBytecode);

      console.log("Executing contract creation...");
      const contractResponse = await contractCreate.execute(this.client);
      
      console.log("Getting contract record...");
      const contractRecord = await contractResponse.getRecord(this.client);
      
      console.log("Contract deployment record:", {
        status: contractRecord.receipt.status.toString(),
        contractId: contractRecord.receipt.contractId?.toString(),
        transactionId: contractRecord.transactionId.toString()
      });

      const newContractId = contractRecord.receipt.contractId;

      if (!newContractId) {
        throw new Error("Failed to get contract ID");
      }

      //Get the receipt of the transaction
      console.log("Getting contract creation receipt...");
      const receiptContractCreateFlow = await contractResponse.getReceipt(
        this.client
      );

      //Get the status of the transaction
      const statusContractCreateFlow = receiptContractCreateFlow.status;

      if (statusContractCreateFlow.toString() !== 'SUCCESS') {
        console.error("Contract deployment failed:", {
          status: statusContractCreateFlow.toString(),
          contractId: newContractId.toString(),
          transactionId: contractResponse.transactionId.toString()
        });
        throw new Error(`Contract deployment failed with status: ${statusContractCreateFlow.toString()}`);
      }

      //Get the Transaction ID
      const txContractCreateId = contractResponse.transactionId.toString();

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
      console.log("Contract ID                :", newContractId.toString());

      return newContractId;
    } catch (error) {
      console.error("Error deploying new contract:", {
        error,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack
      });
      throw error;
    }
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
      console.log("Creating product with parameters:", {
        productId,
        name,
        manufacturer,
        description,
        productType,
        model,
        bytecodeLength: this.contractBytecode.length
      });

      // Deploy a new contract for this product
      console.log("Deploying new contract...");
      const contractId = await this.deployNewContract();
      console.log("Contract deployed successfully with ID:", contractId.toString());

      // Initialize the product in the new contract
      console.log("Initializing product in contract with parameters:", {
        contractId: contractId.toString(),
        gas: 3000000,
        functionName: "createProduct",
        parameters: [productId, name, manufacturer, description, productType, model]
      });

      // Manufacturer ID'yi string olarak kullan
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(3000000)
        .setFunction(
          "createProduct",
          new ContractFunctionParameters()
            .addString(productId)
            .addString(name)
            .addString(manufacturer.toString()) // toString() ekledik
            .addString(description)
            .addString(productType)
            .addString(model)
        );

      console.log("Executing transaction...");
      const txResponse = await transaction.execute(this.client);
      console.log("Transaction executed with ID:", txResponse.transactionId.toString());
      
      try {
        console.log("Getting transaction record for debugging...");
        const record = await txResponse.getRecord(this.client);
        
        // Daha detaylı hata bilgisi
        if (record.contractFunctionResult) {
          console.log("Contract function result:", {
            contractId: record.contractFunctionResult.contractId?.toString(),
            errorMessage: record.contractFunctionResult.errorMessage,
            bloom: record.contractFunctionResult.bloom?.toString(),
            gasUsed: record.contractFunctionResult.gas
          });
        }

        console.log("Transaction record:", {
          status: record.receipt.status.toString(),
          contractId: record.receipt.contractId?.toString(),
          errorMessage: record.receipt.status.toString() !== 'SUCCESS' ? 'Contract execution failed' : undefined
        });

        // Eğer hata varsa daha detaylı bilgi almaya çalış
        if (record.receipt.status.toString() !== 'SUCCESS') {
          console.error("Contract execution failed with details:", {
            status: record.receipt.status.toString(),
            contractId: record.receipt.contractId?.toString(),
            transactionId: record.transactionId.toString()
          });
        }
      } catch (recordError) {
        console.error("Error getting transaction record:", recordError);
      }

      console.log("Getting transaction receipt...");
      const receipt = await txResponse.getReceipt(this.client);
      console.log("Transaction receipt status:", receipt.status.toString());

      return contractId.toString();
    } catch (error) {
      console.error("Detailed error in createProduct:", {
        error,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        parameters: {
          productId,
          name,
          manufacturer,
          description,
          productType,
          model
        }
      });
      throw error;
    }
  }

  async getProduct(productId: string, contractAddress: string) {
    try {
      const contractId = ContractId.fromString(contractAddress);

      const query = new ContractCallQuery()
        .setContractId(contractId)
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
        owner: result.getAddress(8),
        contractAddress: contractId.toString(),
      };
    } catch (error) {
      console.error("Error getting product from blockchain:", error);
      throw error;
    }
  }

  async updateProduct(
    productId: string,
    contractAddress: string,
    name: string,
    manufacturer: string,
    description: string,
    productType: string,
    model: string
  ): Promise<string> {
    try {
      const contractId = ContractId.fromString(contractAddress);

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
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

  async getManufacturerProducts(
    manufacturerAddress: string,
    contractAddress: string
  ): Promise<string[]> {
    try {
      const contractId = ContractId.fromString(contractAddress);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
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

  async deactivateProduct(
    productId: string,
    contractAddress: string
  ): Promise<string> {
    try {
      const contractId = ContractId.fromString(contractAddress);

      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
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
