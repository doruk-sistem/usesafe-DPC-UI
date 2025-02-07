import { 
  Client, 
  AccountId, 
  PrivateKey, 
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";

class HederaTopicService {
  private static instance: HederaTopicService;
  private client: Client | null = null;
  private topicId: string | null = null;

  private constructor() {
    // Initialize topicId from environment variable
    this.topicId = process.env.HEDERA_TOPIC_ID || null;
  }

  public static getInstance(): HederaTopicService {
    if (!HederaTopicService.instance) {
      HederaTopicService.instance = new HederaTopicService();
    }
    return HederaTopicService.instance;
  }

  private async initClient() {
    this.client = Client.forTestnet()
      .setOperator(
        AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
        PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!)
      );
    return this.client;
  }

  async createTopic(): Promise<string> {
    const client = await this.initClient();
    
    try {
      const transaction = new TopicCreateTransaction()
        .setSubmitKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!))
        .setAdminKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!))
        .setTopicMemo("UseSafe Product Records");

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      this.topicId = receipt.topicId!.toString();
      
      console.log(`Created topic with ID: ${this.topicId}`);
      return this.topicId;
    } catch (error) {
      console.error("Error creating topic:", error);
      throw error;
    }
  }

  async submitMessage(message: any): Promise<string> {
    if (!this.topicId) {
      this.topicId = await this.createTopic();
    }

    const client = await this.initClient();
    
    try {
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(JSON.stringify(message));

      const txResponse = await transaction.execute(client);
      await txResponse.getReceipt(client);
      
      return txResponse.transactionId.toString();
    } catch (error) {
      console.error("Error submitting message:", error);
      throw error;
    }
  }

  async getMessages(): Promise<any[]> {
    if (!this.topicId) {
      throw new Error("No topic ID available");
    }

    try {
      // Mirror node API'sini kullan
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/topics/${this.topicId}/messages?limit=25`
      );

      if (!response.ok) {
        throw new Error(`Mirror node error: ${response.statusText}`);
      }

      const data = await response.json();
      const messages: any[] = [];

      if (data.messages && Array.isArray(data.messages)) {
        for (const msg of data.messages) {
          try {
            const decodedMessage = Buffer.from(msg.message, 'base64').toString();
            const parsedMessage = JSON.parse(decodedMessage);
            messages.push({
              ...parsedMessage,
              timestamp: msg.consensus_timestamp,
              sequenceNumber: msg.sequence_number
            });
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }
      }

      return messages;
    } catch (error) {
      console.error("Error querying messages:", error);
      throw error;
    }
  }
}

export const hederaTopicService = HederaTopicService.getInstance(); 