import { Client, AccountId, PrivateKey, AccountBalanceQuery } from "@hashgraph/sdk";

async function testHederaConnection() {
  try {
    // Client oluştur
    const client = Client.forTestnet()
      .setOperator(
        AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!),
        PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!)
      );

    // Basit bir balance sorgusu
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(process.env.HEDERA_ACCOUNT_ID!))
      .execute(client);

    console.log(`Account balance: ${balance.hbars.toString()} HBAR`);
    return true;
  } catch (error) {
    console.error("Hedera connection test failed:", error);
    return false;
  }
}

export { testHederaConnection };
