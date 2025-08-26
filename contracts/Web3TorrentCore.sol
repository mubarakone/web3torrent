// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IWeb3TorrentCore.sol";
import "./LicenseRegistry.sol";
import "./BountyManager.sol";
import "./NetworkRebates.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3TorrentCore
 * @dev Main contract for Web3Torrent decentralized content licensing platform
 * @author Web3Torrent Team
 */
contract Web3TorrentCore is IWeb3TorrentCore, ReentrancyGuard, Ownable {
    
    // State variables
    uint256 public contentCounter;
    
    // Contract references
    LicenseRegistry public licenseRegistry;
    BountyManager public bountyManager;
    NetworkRebates public networkRebates;
    
    // Content storage
    mapping(uint256 => ContentInfo) public contents;
    mapping(uint256 => uint256[]) public priceHistory;
    mapping(uint256 => uint256[]) public priceTimestamps;
    
    // Gas optimization: Cache frequently accessed data
    mapping(uint256 => uint256) private cachedPrices;
    mapping(uint256 => uint256) private lastPriceUpdate;
    
    // Constants for validation
    uint256 public constant MAX_FEE_PERCENTAGE = 100;
    uint256 public constant MIN_DEMAND_MULTIPLIER = 100;
    uint256 public constant MAX_MULTIPLIER_EFFECT = 100000; // 1000x cap
    uint256 public constant PRICE_CACHE_DURATION = 300; // 5 minutes

    // Additional events not in interface
    event BatchLicensesPurchased(
        uint256[] contentIds,
        address indexed distributor,
        uint256 totalCost
    );
    
    // Modifiers
    modifier contentExists(uint256 contentId) {
        require(contentId > 0 && contentId <= contentCounter, "Content does not exist");
        _;
    }
    
    modifier contentActive(uint256 contentId) {
        require(contents[contentId].isActive, "Content is not active");
        _;
    }
    
    modifier onlyPublisher(uint256 contentId) {
        require(contents[contentId].publisher == msg.sender, "Only publisher can call this function");
        _;
    }

    modifier validFeePercentages(uint256 networkFee, uint256 bountyFee) {
        require(networkFee <= MAX_FEE_PERCENTAGE, "Network fee too high");
        require(bountyFee <= MAX_FEE_PERCENTAGE, "Bounty fee too high");
        require(networkFee + bountyFee <= MAX_FEE_PERCENTAGE, "Total fees exceed 100%");
        _;
    }

    constructor() Ownable(msg.sender) {
        contentCounter = 0;
    }

    /**
     * @dev Initialize contract references after deployment
     */
    function initialize(address _licenseRegistry, address _bountyManager, address _networkRebates) external onlyOwner {
        require(_licenseRegistry != address(0), "Invalid license registry");
        require(_bountyManager != address(0), "Invalid bounty manager");
        require(_networkRebates != address(0), "Invalid network rebates");
        
        licenseRegistry = LicenseRegistry(_licenseRegistry);
        bountyManager = BountyManager(_bountyManager);
        networkRebates = NetworkRebates(_networkRebates);
    }

    /**
     * @dev Publish new content with licensing terms
     */
    function publishContent(
        bytes32 magnetHash,
        string calldata metadataURI,
        PricingModel pricingModel,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 demandMultiplier,
        uint256 networkFeePercentage,
        uint256 bountyPercentage
    ) external validFeePercentages(networkFeePercentage, bountyPercentage) returns (uint256) {
        require(basePrice > 0, "Base price must be greater than 0");
        require(magnetHash != bytes32(0), "Invalid magnet hash");
        require(bytes(metadataURI).length > 0, "Metadata URI required");
        
        if (pricingModel == PricingModel.DynamicPrice) {
            require(priceIncrement > 0, "Price increment must be greater than 0 for dynamic pricing");
            require(demandMultiplier >= MIN_DEMAND_MULTIPLIER, "Demand multiplier must be at least 100 (1.0x)");
        }

        contentCounter++;
        uint256 contentId = contentCounter;

        // Use optimized struct with packed variables
        contents[contentId] = ContentInfo({
            publisher: msg.sender,
            magnetHash: magnetHash,
            metadataURI: metadataURI,
            basePrice: basePrice,
            currentPrice: basePrice,
            priceIncrement: priceIncrement,
            demandMultiplier: demandMultiplier,
            publishTimestamp: block.timestamp,
            totalLicenses: 0,
            totalRevenue: 0,
            lastPurchaseTimestamp: 0,
            pricingModel: pricingModel,
            networkFeePercentage: uint8(networkFeePercentage),
            bountyPercentage: uint8(bountyPercentage),
            isActive: true
        });

        // Initialize price history
        priceHistory[contentId].push(basePrice);
        priceTimestamps[contentId].push(block.timestamp);

        emit ContentPublished(contentId, msg.sender, magnetHash, pricingModel, basePrice, priceIncrement);
        return contentId;
    }

    /**
     * @dev Purchase license for content distribution
     */
    function purchaseLicense(uint256 contentId) external payable contentExists(contentId) contentActive(contentId) nonReentrant {
        ContentInfo storage content = contents[contentId];
        uint256 currentPrice = getCurrentPrice(contentId);
        
        require(msg.value >= currentPrice, "Insufficient payment");

        // Process payment and fees in single operation
        _processPayment(contentId, currentPrice);

        // Update content stats
        content.totalLicenses++;
        content.totalRevenue += currentPrice;
        content.lastPurchaseTimestamp = block.timestamp;

        // Handle dynamic pricing and cache updates
        uint256 newPrice = _updatePricing(contentId, currentPrice);

        // Register license
        licenseRegistry.registerLicense(contentId, msg.sender, currentPrice);

        // Refund excess payment
        if (msg.value > currentPrice) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - currentPrice}("");
            require(success, "Refund failed");
        }

        emit LicensePurchased(contentId, msg.sender, currentPrice, newPrice, content.totalLicenses);
    }

    /**
     * @dev Internal function to process payment and fee distribution
     */
    function _processPayment(uint256 contentId, uint256 currentPrice) private {
        ContentInfo storage content = contents[contentId];
        
        // Calculate fees using packed uint8 values
        uint256 networkFee = (currentPrice * uint256(content.networkFeePercentage)) / 100;
        uint256 bountyFee = (currentPrice * uint256(content.bountyPercentage)) / 100;
        uint256 publisherFee = currentPrice - networkFee - bountyFee;

        // Transfer publisher fee
        if (publisherFee > 0) {
            (bool success, ) = payable(content.publisher).call{value: publisherFee}("");
            require(success, "Publisher payment failed");
        }

        // Add to rebate and bounty pools
        if (networkFee > 0) {
            networkRebates.addToRebatePool{value: networkFee}(contentId);
        }
        if (bountyFee > 0) {
            bountyManager.addToBountyPool{value: bountyFee}(contentId);
        }
    }

    /**
     * @dev Internal function to update pricing and cache
     */
    function _updatePricing(uint256 contentId, uint256 currentPrice) private returns (uint256) {
        ContentInfo storage content = contents[contentId];
        
        if (content.pricingModel == PricingModel.FixedPrice) {
            return currentPrice;
        }

        // Calculate new price for dynamic pricing
        uint256 newPrice = _calculateNewPrice(contentId);
        content.currentPrice = newPrice;
        
        // Update price cache
        cachedPrices[contentId] = newPrice;
        lastPriceUpdate[contentId] = block.timestamp;
        
        // Record price change
        priceHistory[contentId].push(newPrice);
        priceTimestamps[contentId].push(block.timestamp);
        
        emit PriceUpdated(contentId, currentPrice, newPrice, content.totalLicenses);
        
        return newPrice;
    }

    /**
     * @dev Purchase multiple licenses in a single transaction (batch operation)
     */
    function purchaseMultipleLicenses(uint256[] calldata contentIds) external payable nonReentrant {
        require(contentIds.length > 0, "No content IDs provided");
        require(contentIds.length <= 50, "Too many licenses in batch"); // Prevent gas limit issues
        
        uint256 totalCost = 0;
        uint256[] memory prices = new uint256[](contentIds.length);
        
        // Calculate total cost first
        for (uint256 i = 0; i < contentIds.length; i++) {
            require(contentIds[i] > 0 && contentIds[i] <= contentCounter, "Invalid content ID");
            require(contents[contentIds[i]].isActive, "Content not active");
            
            prices[i] = getCurrentPrice(contentIds[i]);
            totalCost += prices[i];
        }
        
        require(msg.value >= totalCost, "Insufficient payment for batch");
        
        // Process each license purchase
        for (uint256 i = 0; i < contentIds.length; i++) {
            _processSingleLicense(contentIds[i], prices[i]);
        }
        
        // Refund excess payment
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(success, "Batch refund failed");
        }
        
        emit BatchLicensesPurchased(contentIds, msg.sender, totalCost);
    }

    /**
     * @dev Internal function to process a single license purchase (for batch operations)
     */
    function _processSingleLicense(uint256 contentId, uint256 currentPrice) private {
        ContentInfo storage content = contents[contentId];
        
        // Process payment and fees
        _processPayment(contentId, currentPrice);

        // Update content stats
        content.totalLicenses++;
        content.totalRevenue += currentPrice;
        content.lastPurchaseTimestamp = block.timestamp;

        // Handle dynamic pricing
        uint256 newPrice = _updatePricing(contentId, currentPrice);

        // Register license
        licenseRegistry.registerLicense(contentId, msg.sender, currentPrice);

        emit LicensePurchased(contentId, msg.sender, currentPrice, newPrice, content.totalLicenses);
    }

    /**
     * @dev Get current price for content (handles dynamic pricing logic)
     */
    function getCurrentPrice(uint256 contentId) public view contentExists(contentId) returns (uint256) {
        ContentInfo memory content = contents[contentId];
        
        // Check cache first for dynamic pricing
        if (content.pricingModel == PricingModel.DynamicPrice && 
            lastPriceUpdate[contentId] > 0 && 
            block.timestamp - lastPriceUpdate[contentId] < PRICE_CACHE_DURATION) {
            return cachedPrices[contentId];
        }
        
        if (content.pricingModel == PricingModel.FixedPrice) {
            return content.currentPrice;
        }
        
        return _calculateNewPrice(contentId);
    }

    /**
     * @dev Update content pricing and status (publisher only)
     */
    function updateContent(uint256 contentId, bool isActive) external contentExists(contentId) onlyPublisher(contentId) {
        contents[contentId].isActive = isActive;
        
        // Clear price cache when content status changes
        if (cachedPrices[contentId] > 0) {
            delete cachedPrices[contentId];
            delete lastPriceUpdate[contentId];
        }
        
        emit ContentUpdated(contentId, isActive);
    }

    /**
     * @dev Get content information
     */
    function getContentInfo(uint256 contentId) external view contentExists(contentId) returns (ContentInfo memory) {
        return contents[contentId];
    }

    /**
     * @dev Get price history for a content
     */
    function getPriceHistory(uint256 contentId) external view contentExists(contentId) returns (uint256[] memory prices, uint256[] memory timestamps) {
        return (priceHistory[contentId], priceTimestamps[contentId]);
    }

    /**
     * @dev Get multiple content info in a single call (batch read operation)
     */
    function getMultipleContentInfo(uint256[] calldata contentIds) external view returns (ContentInfo[] memory) {
        require(contentIds.length > 0, "No content IDs provided");
        require(contentIds.length <= 100, "Too many content IDs");
        
        ContentInfo[] memory result = new ContentInfo[](contentIds.length);
        
        for (uint256 i = 0; i < contentIds.length; i++) {
            require(contentIds[i] > 0 && contentIds[i] <= contentCounter, "Invalid content ID");
            result[i] = contents[contentIds[i]];
        }
        
        return result;
    }

    /**
     * @dev Get current prices for multiple content items (batch read operation)
     */
    function getMultiplePrices(uint256[] calldata contentIds) external view returns (uint256[] memory) {
        require(contentIds.length > 0, "No content IDs provided");
        require(contentIds.length <= 100, "Too many content IDs");
        
        uint256[] memory prices = new uint256[](contentIds.length);
        
        for (uint256 i = 0; i < contentIds.length; i++) {
            require(contentIds[i] > 0 && contentIds[i] <= contentCounter, "Invalid content ID");
            prices[i] = getCurrentPrice(contentIds[i]);
        }
        
        return prices;
    }

    /**
     * @dev Update default bounty percentage (owner only)
     */
    function updateDefaultBountyPercentage(uint256 newPercentage) external view onlyOwner {
        require(newPercentage <= 1000, "Percentage too high");
        // This function is kept for potential future use
    }
    
    /**
     * @dev Emergency pause/unpause content (owner only)
     */
    function emergencyToggleContent(uint256 contentId, bool isActive) 
        external 
        onlyOwner 
        contentExists(contentId) 
    {
        contents[contentId].isActive = isActive;
        
        // Clear price cache on emergency toggle
        if (cachedPrices[contentId] > 0) {
            delete cachedPrices[contentId];
            delete lastPriceUpdate[contentId];
        }
        
        emit ContentUpdated(contentId, isActive);
    }

    /**
     * @dev Emergency withdraw function (owner only)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Clear price cache for a content (gas optimization maintenance)
     */
    function clearPriceCache(uint256 contentId) external contentExists(contentId) {
        require(msg.sender == contents[contentId].publisher || msg.sender == owner(), "Not authorized");
        
        delete cachedPrices[contentId];
        delete lastPriceUpdate[contentId];
    }

    /**
     * @dev Calculate new price using efficient mathematical formula (no loops)
     */
    function _calculateNewPrice(uint256 contentId) internal view returns (uint256) {
        ContentInfo memory content = contents[contentId];
        
        if (content.pricingModel == PricingModel.FixedPrice) {
            return content.currentPrice;
        }

        return _calculateDynamicPrice(content);
    }

    /**
     * @dev Calculate dynamic price with linear and exponential components
     */
    function _calculateDynamicPrice(ContentInfo memory content) internal pure returns (uint256) {
        uint256 linearPrice = content.basePrice + (content.totalLicenses * content.priceIncrement);
        
        // If no demand multiplier, return linear price
        if (content.demandMultiplier <= 100 || content.totalLicenses == 0) {
            return linearPrice;
        }

        // Calculate exponential component
        uint256 multiplierEffect = _efficientPower(content.demandMultiplier, content.totalLicenses, 100);
        
        // Cap the multiplier effect to prevent overflow
        if (multiplierEffect > MAX_MULTIPLIER_EFFECT) {
            multiplierEffect = MAX_MULTIPLIER_EFFECT;
        }
        
        // Apply exponential pricing
        uint256 exponentialPrice = (content.basePrice * multiplierEffect) / 100;
        
        // Return the higher of linear or exponential pricing
        return exponentialPrice > linearPrice ? exponentialPrice : linearPrice;
    }

    /**
     * @dev Efficient exponentiation: (base/denominator)^exponent * denominator
     * Uses binary exponentiation to calculate powers efficiently
     * Returns result scaled by denominator to maintain precision
     */
    function _efficientPower(uint256 base, uint256 exponent, uint256 denominator) internal pure returns (uint256) {
        if (exponent == 0) return denominator; // (base/denominator)^0 = 1 = denominator/denominator
        if (exponent == 1) return base;        // (base/denominator)^1 = base
        
        uint256 result = denominator;
        uint256 currentBase = base;
        uint256 currentExp = exponent;
        
        // Binary exponentiation with overflow protection
        while (currentExp > 0) {
            if (currentExp % 2 == 1) {
                // Prevent overflow: if result * currentBase would overflow, cap it
                if (result > type(uint256).max / currentBase) {
                    return MAX_MULTIPLIER_EFFECT; // Return max multiplier
                }
                result = (result * currentBase) / denominator;
            }
            
            // Prevent overflow in squaring
            if (currentBase > type(uint256).max / currentBase) {
                break; // Stop if squaring would overflow
            }
            
            currentBase = (currentBase * currentBase) / denominator;
            currentExp = currentExp / 2;
        }
        
        return result;
    }

    /**
     * @dev Get contract statistics (view function for analytics)
     */
    function getContractStats() external view returns (
        uint256 totalContent,
        uint256 totalRevenue,
        uint256 activeContent
    ) {
        totalContent = contentCounter;
        totalRevenue = 0;
        activeContent = 0;
        
        for (uint256 i = 1; i <= contentCounter; i++) {
            totalRevenue += contents[i].totalRevenue;
            if (contents[i].isActive) {
                activeContent++;
            }
        }
    }
} 