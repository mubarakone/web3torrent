# Web3Torrent Smart Contracts Overview

This document provides a comprehensive overview of the Web3Torrent smart contract system, which implements a decentralized content licensing and distribution platform with **continuous dynamic pricing**, P2P incentives, and automated copyright protection.

## Architecture Overview

The Web3Torrent system consists of four main smart contracts:

1. **Web3TorrentCore** - Main orchestrator for content publishing and licensing
2. **LicenseRegistry** - Manages content licenses and platform registrations
3. **BountyManager** - Handles copyright enforcement and bounty distributions
4. **NetworkRebates** - Manages P2P seeding rewards and rebate distribution
5. **Web3TorrentFactory** - Factory contract for deploying complete system instances

## 1. Web3TorrentCore Contract

### Purpose
The central contract that orchestrates content publishing, license purchasing, and fee distribution with **continuous dynamic pricing**.

### Key Responsibilities
- Content publishing with flexible pricing models (Fixed or Dynamic)
- License purchasing with automatic price adjustments
- Fee calculation and distribution
- Content lifecycle management

### Core Features

#### Dynamic Pricing System
```solidity
struct ContentInfo {
    PricingModel pricingModel;      // Fixed or Dynamic
    uint256 basePrice;              // Starting price
    uint256 currentPrice;           // Current market price
    uint256 priceIncrement;         // Linear price increase per purchase
    uint256 demandMultiplier;       // Exponential multiplier for viral content
    uint256 totalLicenses;          // Number of licenses sold
    uint256 lastPurchaseTimestamp;  // Last purchase time
}
```

#### Price Calculation Algorithm
- **Fixed Price**: Price remains constant
- **Dynamic Price**: 
  - Linear growth: `newPrice = basePrice + (totalLicenses * priceIncrement)`
  - Exponential multiplier: Applied for viral content based on `demandMultiplier`
  - **No time limits**: Prices adjust purely based on demand

### Key Functions

#### `publishContent()`
```solidity
function publishContent(
    bytes32 magnetHash,
    string calldata metadataURI,
    PricingModel pricingModel,
    uint256 basePrice,
    uint256 priceIncrement,        // New: for dynamic pricing
    uint256 demandMultiplier,      // New: viral content multiplier
    uint256 networkFeePercentage,
    uint256 bountyPercentage
) external returns (uint256)
```

**Features:**
- Supports both fixed and dynamic pricing models
- Validates pricing parameters for dynamic content
- Initializes price history tracking
- Emits `ContentPublished` event with pricing details

#### `purchaseLicense()`
```solidity
function purchaseLicense(uint256 contentId) external payable
```

**Enhanced Features:**
- Calculates current price using dynamic pricing algorithm
- Automatically updates price for next purchase (dynamic content)
- Records price changes in history
- Distributes fees to publisher, network rebates, and bounty pool
- Emits `PriceUpdated` event for dynamic content

#### `getCurrentPrice()`
```solidity
function getCurrentPrice(uint256 contentId) external view returns (uint256)
```

**Dynamic Pricing Logic:**
- Real-time price calculation based on current demand
- Considers both linear increment and exponential multiplier
- No time-based decay or expiration

#### `getPriceHistory()`
```solidity
function getPriceHistory(uint256 contentId) 
    external view returns (uint256[] memory prices, uint256[] memory timestamps)
```

**New Feature:**
- Returns complete price evolution for analytics
- Enables price trend visualization in UI
- Supports market analysis and forecasting

### Interaction Flow

1. **Publisher** calls `publishContent()` with pricing model and parameters
2. **Distributors** call `getCurrentPrice()` to check current licensing cost
3. **Distributors** call `purchaseLicense()` to acquire distribution rights
4. **Price automatically updates** for dynamic content (no manual intervention)
5. **Fees distributed** to publisher, P2P network, and bounty pool
6. **License registered** in LicenseRegistry for anti-piracy tracking

### Security Features
- Input validation for all pricing parameters
- Overflow protection in price calculations
- Publisher-only content management
- Emergency pause functionality

## 2. LicenseRegistry Contract

### Purpose
Manages legitimate content licenses and platform registrations for anti-piracy enforcement.

### Key Functions

#### `registerLicense()`
- Called automatically by Web3TorrentCore during purchase
- Records license with purchase price and timestamp
- Links distributor to content for legitimate distribution tracking

#### `registerPlatform()`
- Allows distributors to register their platform publications
- Creates audit trail for legitimate content distribution
- Supports anti-piracy verification by bounty hunters

#### `hasValidLicense()`
- Verifies if a distributor has legitimate rights to content
- Used by bounty system to distinguish piracy from licensed distribution

## 3. BountyManager Contract

### Purpose
Implements crowdsourced copyright enforcement with zkTLS proof verification.

### Key Features
- Bounty pool funding from license purchases
- zkTLS proof submission for takedown requests
- Multi-verifier consensus system
- Reward distribution for verified takedowns

### Enhanced Anti-Piracy Integration
- Cross-references LicenseRegistry to verify legitimate distributions
- Distinguishes between piracy and licensed content
- Supports platform-specific takedown procedures

## 4. NetworkRebates Contract

### Purpose
Incentivizes P2P content sharing through seeding rewards.

### Key Features
- Rebate pool funding from network fees
- Seeding activity reporting and verification
- Proportional reward distribution based on contribution
- Oracle-based activity validation

### P2P Economics
- Rewards distributors for maintaining content availability
- Creates sustainable incentive for network participation
- Reduces bandwidth costs for content publishers

## 5. Web3TorrentFactory Contract

### Purpose
Simplifies deployment and initialization of complete Web3Torrent system instances.

### Key Features
- One-click deployment of all contracts
- Automatic contract initialization and linking
- Deployment tracking and management
- Emergency controls for deployed instances

## Economic Model Implementation

### Dynamic Pricing Benefits

1. **Market-Driven Pricing**
   - Prices reflect true content demand
   - No artificial time constraints
   - Continuous price discovery

2. **Early Adopter Rewards**
   - Lower prices for early distributors
   - Incentivizes content discovery and promotion
   - Creates viral distribution dynamics

3. **Publisher Revenue Optimization**
   - Popular content achieves higher valuations
   - No missed revenue from underpriced auctions
   - Sustained income from quality content

4. **Network Sustainability**
   - Balanced fee structure supports all participants
   - P2P rebates maintain content availability
   - Copyright protection preserves creator rights

### Fee Structure
- **Publisher Fee**: Majority of license price (varies by content)
- **Network Fee**: Funds P2P seeding rebates (typically 10-15%)
- **Bounty Fee**: Funds copyright enforcement (typically 5-10%)

### Pricing Models Comparison

| Model | Price Behavior | Best For | Benefits |
|-------|---------------|----------|----------|
| **Fixed** | Constant price | Stable content, known demand | Predictable costs, simple licensing |
| **Dynamic** | Increases with demand | Viral content, unknown demand | Market-driven pricing, revenue optimization |

## Key Innovations

### 1. Continuous Dynamic Pricing
- **No auction time limits**: Content remains available indefinitely
- **Pure demand-based pricing**: Market determines true value
- **Exponential growth support**: Viral content can achieve premium pricing
- **Price history tracking**: Enables analytics and market insights

### 2. Integrated Anti-Piracy System
- **zkTLS proof verification**: Cryptographic proof of unauthorized usage
- **Licensed distribution tracking**: Distinguishes piracy from legitimate use
- **Crowdsourced enforcement**: Scalable copyright protection
- **Platform-agnostic takedowns**: Works across all major platforms

### 3. P2P Economic Incentives
- **Seeding rewards**: Direct compensation for bandwidth contribution
- **Network sustainability**: Self-sustaining distribution infrastructure
- **Quality-based rewards**: Better seeders earn more rebates

### 4. Factory Deployment Pattern
- **Simplified setup**: One transaction deploys entire system
- **Standardized architecture**: Consistent contract interfaces
- **Upgradeable instances**: Support for system evolution

## Gas Optimization Features

1. **Batch Operations**: Multiple licenses can be purchased in single transaction
2. **Efficient Storage**: Optimized data structures minimize storage costs
3. **Event-Driven Architecture**: Reduces on-chain computation requirements
4. **Lazy Price Updates**: Prices calculated on-demand rather than continuously

## Deployment Instructions

### Using Factory Contract
```solidity
// Deploy complete system
(uint256 deploymentId, 
 address coreContract, 
 address licenseRegistry, 
 address bountyManager, 
 address networkRebates) = factory.deployWeb3TorrentSystem();
```

### Manual Deployment
1. Deploy Web3TorrentCore
2. Deploy LicenseRegistry with core address
3. Deploy BountyManager with core and registry addresses
4. Deploy NetworkRebates with core and registry addresses
5. Call `initialize()` on core contract with all addresses

## Integration Examples

### Publishing Dynamic Content
```solidity
// Publish with dynamic pricing
uint256 contentId = core.publishContent(
    magnetHash,
    "ipfs://metadata-uri",
    PricingModel.DynamicPrice,
    0.05 ether,          // base price
    0.005 ether,         // price increment per purchase
    110,                 // 1.1x demand multiplier
    15,                  // 15% network fee
    5                    // 5% bounty fee
);
```

### Purchasing License
```solidity
// Check current price
uint256 currentPrice = core.getCurrentPrice(contentId);

// Purchase license
core.purchaseLicense{value: currentPrice}(contentId);
```

### Tracking Price History
```solidity
// Get price evolution
(uint256[] memory prices, uint256[] memory timestamps) = 
    core.getPriceHistory(contentId);
```

This smart contract system provides a comprehensive foundation for decentralized content licensing with **continuous dynamic pricing**, ensuring fair compensation for creators while maintaining sustainable P2P distribution networks and robust copyright protection. 