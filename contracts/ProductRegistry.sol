// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string name;
        string manufacturer;
        string description;
        string productType;
        string model;
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        address owner;
    }
    
    mapping(string => Product) public products;
    mapping(address => string[]) public manufacturerProducts;
    
    event ProductCreated(
        string indexed productId,
        string name,
        string manufacturer,
        address owner,
        uint256 timestamp
    );
    
    event ProductUpdated(
        string indexed productId,
        string name,
        string manufacturer,
        uint256 timestamp
    );
    
    modifier onlyProductOwner(string memory productId) {
        require(products[productId].owner == msg.sender, "Not authorized");
        _;
    }
    
    function createProduct(
        string memory productId,
        string memory name,
        string memory manufacturer,
        string memory description,
        string memory productType,
        string memory model
    ) public {
        require(products[productId].createdAt == 0, "Product already exists");
        
        products[productId] = Product({
            name: name,
            manufacturer: manufacturer,
            description: description,
            productType: productType,
            model: model,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            owner: msg.sender
        });
        
        manufacturerProducts[msg.sender].push(productId);
        
        emit ProductCreated(
            productId,
            name,
            manufacturer,
            msg.sender,
            block.timestamp
        );
    }
    
    function updateProduct(
        string memory productId,
        string memory name,
        string memory manufacturer,
        string memory description,
        string memory productType,
        string memory model
    ) public onlyProductOwner(productId) {
        require(products[productId].createdAt > 0, "Product does not exist");
        require(products[productId].isActive, "Product is not active");
        
        Product storage product = products[productId];
        product.name = name;
        product.manufacturer = manufacturer;
        product.description = description;
        product.productType = productType;
        product.model = model;
        product.updatedAt = block.timestamp;
        
        emit ProductUpdated(
            productId,
            name,
            manufacturer,
            block.timestamp
        );
    }
    
    function getProduct(string memory productId) public view returns (
        string memory name,
        string memory manufacturer,
        string memory description,
        string memory productType,
        string memory model,
        uint256 createdAt,
        uint256 updatedAt,
        bool isActive,
        address owner
    ) {
        Product memory product = products[productId];
        require(product.createdAt > 0, "Product does not exist");
        
        return (
            product.name,
            product.manufacturer,
            product.description,
            product.productType,
            product.model,
            product.createdAt,
            product.updatedAt,
            product.isActive,
            product.owner
        );
    }
    
    function getManufacturerProducts(address manufacturer) public view returns (string[] memory) {
        return manufacturerProducts[manufacturer];
    }
    
    function deactivateProduct(string memory productId) public onlyProductOwner(productId) {
        require(products[productId].createdAt > 0, "Product does not exist");
        products[productId].isActive = false;
        products[productId].updatedAt = block.timestamp;
    }
} 