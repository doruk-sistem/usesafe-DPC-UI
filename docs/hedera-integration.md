# Hedera Blockchain Integration

This document outlines the implementation details for integrating the Hedera blockchain into the UseSafe DPC-UI application.

## Overview

The application uses Hedera's blockchain technology to record product information in a secure and immutable way. This ensures product authenticity and traceability throughout the supply chain.

## Architecture

The blockchain integration consists of:

1. **ProductBlockchainContractService** - A singleton service that interacts with the Hedera smart contract
2. **ProductBlockchainService** - A higher-level service that wraps the contract service and provides business logic

## Configuration

### Environment Variables

The following environment variables are used for Hedera configuration:

```
NEXT_PUBLIC_HEDERA_OPERATOR_ID=0.0.5442115
NEXT_PUBLIC_HEDERA_OPERATOR_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_PRODUCT_REGISTRY_CONTRACT=0x00000000000000000000000000000000000eb0f6
```

> **IMPORTANT**: In a production environment, private keys should NEVER be exposed in client-side code. They should be stored securely on a backend server and accessed via authenticated APIs.

### Content Security Policy (CSP)

The application includes a Content Security Policy that allows connections to Hedera's testnet and mainnet nodes:

```
connect-src 'self' https://*.hedera.com wss://*.hedera.com https://testnet-node*.hedera.com https://mainnet-node*.hedera.com
```

This is necessary to allow the browser to make API calls to Hedera's nodes.

## API Functions

### Creating Products

```typescript
async recordProductAction(
  id: string,
  name: string,
  manufacturer: string,
  description: string,
  action: ProductBlockchainAction
): Promise<{ transactionId: string; contractAddress: string }>
```

This function records product information on the blockchain, supporting both creation and updates.

### Reading Product History

```typescript
async getProductHistory(productId?: string): Promise<ProductBlockchainRecord[]>
```

Retrieves the history of actions performed on a product from the blockchain.

## Browser Compatibility

The Hedera SDK has been configured to work properly in browser environments:

1. **Retry Settings**: The client is configured with 5 maximum attempts to handle temporary connection issues
2. **Timeout Settings**: A 15-second timeout is set to prevent hanging requests
3. **Error Handling**: Comprehensive error handling is implemented to provide meaningful feedback

## Troubleshooting

### Common Issues

1. **Content Security Policy Violations**: If you see CSP errors in the console, verify that the middleware.ts file has the correct CSP configuration.

2. **Connection Timeouts**: If transactions are timing out, check network connectivity and Hedera node status.

3. **Authentication Errors**: Verify that the OPERATOR_ID and OPERATOR_PRIVATE_KEY environment variables are correctly set.

## Future Improvements

1. Move blockchain operations to a secure backend service
2. Implement proper key management system
3. Add transaction caching for improved performance
4. Implement offline capabilities with transaction queuing 