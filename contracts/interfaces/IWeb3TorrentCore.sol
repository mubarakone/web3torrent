// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IWeb3TorrentCore
 * @dev Interface for Web3Torrent core contract with all data structures and events
 */
interface IWeb3TorrentCore {
    
    enum PricingModel {
        FixedPrice,
        DynamicPrice
    }
    
    // Optimized struct with packed variables to reduce storage slots
    struct ContentInfo {
        address publisher;              // 20 bytes - slot 0
        bytes32 magnetHash;             // 32 bytes - slot 1
        string metadataURI;             // dynamic - slot 2+
        uint256 basePrice;              // 32 bytes - slot 3
        uint256 currentPrice;           // 32 bytes - slot 4
        uint256 priceIncrement;         // 32 bytes - slot 5
        uint256 demandMultiplier;       // 32 bytes - slot 6
        uint256 publishTimestamp;       // 32 bytes - slot 7
        uint256 totalLicenses;          // 32 bytes - slot 8
        uint256 totalRevenue;           // 32 bytes - slot 9
        uint256 lastPurchaseTimestamp;  // 32 bytes - slot 10
        
        // Packed into single slot (slot 11):
        PricingModel pricingModel;      // 1 byte (enum)
        uint8 networkFeePercentage;     // 1 byte (0-100%)
        uint8 bountyPercentage;         // 1 byte (0-100%)
        bool isActive;                  // 1 byte
        // 28 bytes remaining in slot 11
    }
    
    // Events
    event ContentPublished(
        uint256 indexed contentId,
        address indexed publisher,
        bytes32 magnetHash,
        PricingModel pricingModel,
        uint256 basePrice,
        uint256 priceIncrement
    );
    
    event LicensePurchased(
        uint256 indexed contentId,
        address indexed distributor,
        uint256 price,
        uint256 newPrice,
        uint256 totalLicenses
    );
    
    event ContentUpdated(
        uint256 indexed contentId,
        bool isActive
    );
    
    event PriceUpdated(
        uint256 indexed contentId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 totalLicenses
    );
    
    // Functions
    function publishContent(
        bytes32 magnetHash,
        string calldata metadataURI,
        PricingModel pricingModel,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 demandMultiplier,
        uint256 networkFeePercentage,
        uint256 bountyPercentage
    ) external returns (uint256);
    
    function purchaseLicense(uint256 contentId) external payable;
    
    function getCurrentPrice(uint256 contentId) external view returns (uint256);
    
    function updateContent(uint256 contentId, bool isActive) external;
    
    function getContentInfo(uint256 contentId) external view returns (ContentInfo memory);
    
    function getPriceHistory(uint256 contentId) external view returns (uint256[] memory prices, uint256[] memory timestamps);
} 