---

## 🔐 Phase 1: Smart Contract Architecture

We'll break this into 3 core modules:

---

### **1. LicenseRegistry.sol**

Handles publishing, licensing, and distributor access.

#### ✅ Responsibilities:

* Register content (by publisher).
* Manage flat-rate or auction-based licenses.
* Track licensed distributors and expiration.
* Emit license purchase events for downstream validation.

#### 🧱 Key Structs:

```solidity
struct Content {
    bytes32 contentHash;       // IPFS or torrent magnet hash
    address publisher;
    uint256 bountyFeePercent;  // e.g. 10%
    bool auctionBased;
    uint256 licenseFee;        // for flat rate
    bool exists;
}

struct License {
    address distributor;
    bytes32 contentHash;
    uint256 issuedAt;
    uint256 expiresAt;         // 0 if permanent
}
```

#### 🔧 Key Functions:

```solidity
function publishContent(bytes32 contentHash, uint256 licenseFee, uint256 bountyFeePercent, bool isAuction) external;
function purchaseLicense(bytes32 contentHash) external payable;
function getLicense(bytes32 contentHash, address distributor) external view returns (License memory);
```

---

### **2. DistributionRegistry.sol**

Stores which distributors posted content where, to avoid false bounty flags.

#### ✅ Responsibilities:

* Record which platform URLs each distributor publishes to.
* Store in a verifiable structure (Merkle root or hashed commitments).
* Used by Bounty Hunters to verify legit vs pirated.

#### 🧱 Key Structs:

```solidity
struct PlatformEntry {
    string url;         // e.g. youtube.com/channel/xyz
    string platform;    // e.g. "YouTube"
    uint256 timestamp;
}
```

#### 🔧 Key Functions:

```solidity
function registerPlatform(bytes32 contentHash, string calldata platform, string calldata url) external;
function isAuthorizedPublisher(bytes32 contentHash, string calldata platform, string calldata url) external view returns (bool);
```

---

### **3. BountyPool.sol**

Handles bounty reward pool and zkTLS takedown validation.

#### ✅ Responsibilities:

* Receive bounty fee % from license sales.
* Accept and verify zkTLS proofs of unauthorized content.
* Split bounty pool rewards proportionally.

#### 🧱 Key Structs:

```solidity
struct TakedownClaim {
    address hunter;
    bytes32 contentHash;
    string platform;
    string url;
    bytes zkProof;
    bool verified;
}
```

#### 🔧 Key Functions:

```solidity
function submitClaim(bytes32 contentHash, string calldata platform, string calldata url, bytes calldata zkProof) external;
function distributeBounties() external; // distributes pool proportionally
```

> Optionally integrate a **ZK Verifier Contract** here that checks validity of zkTLS proofs on-chain.

---

## 🔒 Phase 2: zkTLS Takedown Flow

Assumes use of **Reclaim Protocol** or similar to generate TLS-based ZK proofs.

### Flow:

1. Bounty Hunter finds unauthorized content on YouTube.
2. Submits a takedown via YouTube's copyright form.
3. Uses a zkTLS wallet or attestation client to prove:

   * They accessed YouTube.
   * The content existed.
   * They submitted a takedown request.
4. Generates a `zkProof` → submits it to `BountyPool.sol`.
5. zkVerifier checks validity on-chain.
6. If verified, claim is marked `verified = true`.

---

## 💻 Phase 3: Frontend Roles

### **Publisher Dashboard**

* Upload content (IPFS/torrent magnet).
* Choose pricing model (flat or auction).
* Monitor licensing revenue + bounty pool balances.

### **Distributor Dashboard**

* Browse available content.
* Purchase license, view terms.
* Register platforms they've published to.
* See rebate/ROI dashboard from ad revenue.

### **Bounty Hunter Dashboard**

* Scan YouTube/Spotify/etc for unauthorized content.
* Generate zkTLS proof (Reclaim Protocol client).
* Submit to contract.
* View takedown history + earnings.

### Initial Scaffolding
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContentLicensingProtocol
 * @notice Core contract to handle publishing, licensing, distributor registry, and bounty reward flow.
 * Uses stablecoins for payments, zkTLS via Reclaim Protocol for bounty verification.
 */

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract ContentLicensingProtocol {
    IERC20 public stablecoin;

    struct Content {
        bytes32 contentHash;
        address publisher;
        uint256 licenseFee;
        uint256 bountyFeePercent; // e.g. 1000 = 10% (basis points)
        bool auctionBased;
        bool exists;
    }

    struct License {
        address distributor;
        bytes32 contentHash;
        uint256 issuedAt;
        uint256 expiresAt; // 0 means no expiration
    }

    struct PlatformEntry {
        string platform;
        string url;
        uint256 timestamp;
    }

    struct TakedownClaim {
        address hunter;
        bytes32 contentHash;
        string platform;
        string url;
        bytes zkProof;
        bool verified;
    }

    mapping(bytes32 => Content) public contents;
    mapping(bytes32 => License[]) public licenses;
    mapping(bytes32 => PlatformEntry[]) public platformRegistry;
    mapping(bytes32 => TakedownClaim[]) public takedownClaims;
    mapping(bytes32 => uint256) public bountyPools;

    event ContentPublished(bytes32 indexed contentHash, address indexed publisher);
    event LicensePurchased(bytes32 indexed contentHash, address indexed distributor);
    event PlatformRegistered(bytes32 indexed contentHash, address indexed distributor, string platform, string url);
    event TakedownClaimSubmitted(bytes32 indexed contentHash, address indexed hunter);

    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
    }

    function publishContent(bytes32 contentHash, uint256 licenseFee, uint256 bountyFeePercent, bool auctionBased) external {
        require(!contents[contentHash].exists, "Already published");

        contents[contentHash] = Content({
            contentHash: contentHash,
            publisher: msg.sender,
            licenseFee: licenseFee,
            bountyFeePercent: bountyFeePercent,
            auctionBased: auctionBased,
            exists: true
        });

        emit ContentPublished(contentHash, msg.sender);
    }

    function purchaseLicense(bytes32 contentHash, uint256 expiresAt) external {
        Content memory content = contents[contentHash];
        require(content.exists, "Invalid content");
        require(!content.auctionBased, "Auction mode not supported yet");

        uint256 bountyShare = (content.licenseFee * content.bountyFeePercent) / 10000;
        uint256 publisherShare = content.licenseFee - bountyShare;

        require(stablecoin.transferFrom(msg.sender, address(this), content.licenseFee), "Payment failed");
        require(stablecoin.transfer(content.publisher, publisherShare), "Publisher payment failed");
        bountyPools[contentHash] += bountyShare;

        licenses[contentHash].push(License({
            distributor: msg.sender,
            contentHash: contentHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt
        }));

        emit LicensePurchased(contentHash, msg.sender);
    }

    function registerPlatform(bytes32 contentHash, string calldata platform, string calldata url) external {
        bool isLicensed = false;
        for (uint i = 0; i < licenses[contentHash].length; i++) {
            if (licenses[contentHash][i].distributor == msg.sender) {
                isLicensed = true;
                break;
            }
        }
        require(isLicensed, "Only licensed distributor can register");

        platformRegistry[contentHash].push(PlatformEntry({
            platform: platform,
            url: url,
            timestamp: block.timestamp
        }));

        emit PlatformRegistered(contentHash, msg.sender, platform, url);
    }

    function submitTakedownClaim(bytes32 contentHash, string calldata platform, string calldata url, bytes calldata zkProof) external {
        // In production, you'd call an on-chain zkVerifier here (e.g., Reclaim zkTLS verifier)

        takedownClaims[contentHash].push(TakedownClaim({
            hunter: msg.sender,
            contentHash: contentHash,
            platform: platform,
            url: url,
            zkProof: zkProof,
            verified: true // assume verified for now
        }));

        emit TakedownClaimSubmitted(contentHash, msg.sender);
    }

    // Future function to calculate and distribute rewards among verified hunters
    // based on takedownClaims[contentHash] proportionally
}
```
