import { Client, AccountId, PrivateKey, AccountBalanceQuery } from "@hashgraph/sdk";

async function testHederaConnection() {
  try {
    const accountId = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID;
    const privateKey = process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY;
    
    if (!accountId || !privateKey) {
      throw new Error("Hedera credentials not found in environment variables");
    }
    
    // Client oluştur
    const client = Client.forTestnet()
      .setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromString(privateKey)
      );

    // Basit bir balance sorgusu
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(client);

    console.log(`Account balance: ${balance.hbars.toString()} HBAR`);
    return true;
  } catch (error) {
    console.error("Hedera connection test failed:", error);
    return false;
  }
}

export { testHederaConnection };
