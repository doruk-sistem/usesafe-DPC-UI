// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ProductRegistry {

    struct Product {
        string productId;
        string name;
        string description;
        uint256 timestamp;
        string status; // "DRAFT", "NEW", "UPDATED", "DELETED", etc.
    }

    mapping(string => Product) public products;

    event ProductCreated(string productId, string name, uint256 timestamp);
    event ProductUpdated(string productId, string name, uint256 timestamp);


    function createProduct(string memory _productId, string memory _name, string memory _description, string memory _status) public {
        require(bytes(products[_productId].productId).length == 0, "Product already exists");

        Product memory newProduct = Product({
            productId: _productId,
            name: _name,
            description: _description,
            timestamp: block.timestamp,
            status: _status
        });

        products[_productId] = newProduct;
        emit ProductCreated(_productId, _name, block.timestamp);
    }


     function updateProduct(string memory _productId, string memory _name, string memory _description, string memory _status) public {
        require(bytes(products[_productId].productId).length > 0, "Product does not exist");

        products[_productId] = Product({
            productId: _productId,
            name: _name,
            description: _description,
            timestamp: block.timestamp, // Update the timestamp
            status: _status
        });

        emit ProductUpdated(_productId, _name, block.timestamp);
    }

    function getProduct(string memory _productId) public view returns (Product memory) {
        return products[_productId];
    }
} 