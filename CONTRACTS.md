## 🔐 Phase 1: Smart Contract Architecture

We'll break this into 3 core modules:

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
---

## Initial Scaffolding
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

---

## 📄 1. `LicenseRegistry.sol`

Handles publishing content and licensing distributors.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract LicenseRegistry {
    struct Content {
        bytes32 contentHash;
        address publisher;
        uint256 licenseFee;
        uint256 bountyFeePercent; // out of 1000 (e.g. 50 = 5%)
        bool auctionBased;
        bool exists;
    }

    struct License {
        address distributor;
        bytes32 contentHash;
        uint256 issuedAt;
        uint256 expiresAt; // 0 = no expiration
    }

    address public stablecoin; // e.g. USDC address
    address public bountyPool;

    mapping(bytes32 => Content) public contents;
    mapping(bytes32 => mapping(address => License)) public licenses;

    event ContentPublished(bytes32 indexed contentHash, address indexed publisher);
    event LicensePurchased(bytes32 indexed contentHash, address indexed distributor);

    constructor(address _stablecoin, address _bountyPool) {
        stablecoin = _stablecoin;
        bountyPool = _bountyPool;
    }

    function publishContent(
        bytes32 contentHash,
        uint256 licenseFee,
        uint256 bountyFeePercent,
        bool isAuction
    ) external {
        require(!contents[contentHash].exists, "Content already exists");
        require(bountyFeePercent <= 1000, "Invalid bounty fee");

        contents[contentHash] = Content({
            contentHash: contentHash,
            publisher: msg.sender,
            licenseFee: licenseFee,
            bountyFeePercent: bountyFeePercent,
            auctionBased: isAuction,
            exists: true
        });

        emit ContentPublished(contentHash, msg.sender);
    }

    function purchaseLicense(bytes32 contentHash, uint256 expiresAt) external {
        Content memory content = contents[contentHash];
        require(content.exists, "Invalid content");

        require(licenses[contentHash][msg.sender].issuedAt == 0, "Already licensed");

        uint256 bountyPortion = (content.licenseFee * content.bountyFeePercent) / 1000;
        uint256 publisherPortion = content.licenseFee - bountyPortion;

        IERC20 stable = IERC20(stablecoin);
        require(stable.transferFrom(msg.sender, content.publisher, publisherPortion), "Publisher payment failed");
        require(stable.transferFrom(msg.sender, bountyPool, bountyPortion), "Bounty payment failed");

        licenses[contentHash][msg.sender] = License({
            distributor: msg.sender,
            contentHash: contentHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt
        });

        emit LicensePurchased(contentHash, msg.sender);
    }

    function isLicensed(bytes32 contentHash, address distributor) external view returns (bool) {
        License memory lic = licenses[contentHash][distributor];
        if (lic.issuedAt == 0) return false;
        if (lic.expiresAt > 0 && block.timestamp > lic.expiresAt) return false;
        return true;
    }
}
```

---

## 📄 2. `DistributionRegistry.sol`

Distributors record where they upload the content (to avoid bounty flags).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DistributionRegistry {
    struct PlatformEntry {
        string platform;
        string url;
        uint256 timestamp;
    }

    mapping(bytes32 => mapping(address => PlatformEntry[])) public uploads;

    event PlatformRegistered(bytes32 indexed contentHash, address indexed distributor, string platform, string url);

    function registerPlatform(
        bytes32 contentHash,
        string calldata platform,
        string calldata url
    ) external {
        uploads[contentHash][msg.sender].push(
            PlatformEntry({ platform: platform, url: url, timestamp: block.timestamp })
        );
        emit PlatformRegistered(contentHash, msg.sender, platform, url);
    }

    function getUploads(bytes32 contentHash, address distributor) external view returns (PlatformEntry[] memory) {
        return uploads[contentHash][distributor];
    }

    function isAuthorizedUpload(bytes32 contentHash, address distributor, string calldata url) external view returns (bool) {
        PlatformEntry[] memory entries = uploads[contentHash][distributor];
        for (uint i = 0; i < entries.length; i++) {
            if (keccak256(bytes(entries[i].url)) == keccak256(bytes(url))) {
                return true;
            }
        }
        return false;
    }
}
```

---

## 📄 3. `BountyPool.sol`

Accepts zkTLS proof of unauthorized uploads and rewards bounty hunters.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IZKVerifier {
    function verify(bytes calldata zkProof) external view returns (bool);
}

contract BountyPool {
    struct Claim {
        address hunter;
        bytes32 contentHash;
        string platform;
        string url;
        bool verified;
    }

    IERC20 public stablecoin;
    IZKVerifier public verifier;

    Claim[] public claims;
    mapping(bytes32 => bool) public proofSubmitted;

    address public licenseRegistry;
    address public distributionRegistry;

    event ClaimSubmitted(address indexed hunter, bytes32 indexed contentHash, string platform, string url);
    event ClaimVerified(uint indexed claimId, address indexed hunter);

    constructor(address _stablecoin, address _verifier, address _licenseRegistry, address _distributionRegistry) {
        stablecoin = IERC20(_stablecoin);
        verifier = IZKVerifier(_verifier);
        licenseRegistry = _licenseRegistry;
        distributionRegistry = _distributionRegistry;
    }

    function submitClaim(
        bytes32 contentHash,
        string calldata platform,
        string calldata url,
        bytes calldata zkProof
    ) external {
        require(!proofSubmitted[keccak256(zkProof)], "Proof already submitted");
        require(verifier.verify(zkProof), "Invalid proof");

        proofSubmitted[keccak256(zkProof)] = true;
        claims.push(Claim({
            hunter: msg.sender,
            contentHash: contentHash,
            platform: platform,
            url: url,
            verified: true
        }));

        emit ClaimSubmitted(msg.sender, contentHash, platform, url);
        emit ClaimVerified(claims.length - 1, msg.sender);
    }

    // Optional: distribute reward after a window of claims (not included here for brevity)
}
```

## ✅ Next Step Suggestions:

- Create:

   * The **ZK verifier stub** for integrating with Reclaim Protocol's on-chain verifier.
   * A **claim payout function** based on bounty shares.
---

## Improved Scaffolding
Below is a first-pass scaffold for the three core contracts. They assume:

* Payments in a stable‐coin (an ERC-20 whose address is passed into each contract).
* zkTLS proofs verified via the Reclaim Protocol’s on-chain verifier (you’d link in their Verifier interface).
* No native tokens—rebates and bounties are paid in the stable-coin.

You can refine or add access control (e.g. OpenZeppelin’s Ownable, Roles), events, and modifiers as you go.

---

## 1. LicenseRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStableCoin is IERC20 {}

contract LicenseRegistry {
    IStableCoin public immutable stablecoin;
    address public owner;

    struct Content {
        address publisher;
        uint256 licenseFee;        // amount in stablecoin (flat rate or final auction price)
        uint256 bountyFeePercent;  // e.g. 10 = 10%
        bool    isAuction;
        bool    exists;
    }

    struct License {
        address distributor;
        uint256 purchasedAt;
        uint256 expiresAt;         // zero = no expiration
    }

    // contentHash => Content
    mapping(bytes32 => Content) public contents;
    // contentHash => distributor => License
    mapping(bytes32 => mapping(address => License)) public licenses;

    event ContentPublished(bytes32 indexed contentHash, address indexed publisher);
    event LicensePurchased(bytes32 indexed contentHash, address indexed distributor, uint256 amount);
    event AuctionBid(bytes32 indexed contentHash, address indexed bidder, uint256 bidAmount);
    event LicenseRenewed(bytes32 indexed contentHash, address indexed distributor, uint256 newExpiry);

    modifier onlyPublisher(bytes32 contentHash) {
        require(contents[contentHash].publisher == msg.sender, "Not publisher");
        _;
    }

    constructor(address _stablecoin) {
        stablecoin = IStableCoin(_stablecoin);
        owner = msg.sender;
    }

    /// @notice Publisher creates a new content entry
    function publishContent(
        bytes32 contentHash,
        uint256 licenseFee,
        uint256 bountyFeePercent,
        bool    isAuction
    ) external {
        require(!contents[contentHash].exists, "Already exists");
        require(bountyFeePercent <= 100, "Percent >100");
        contents[contentHash] = Content({
            publisher:        msg.sender,
            licenseFee:       licenseFee,
            bountyFeePercent: bountyFeePercent,
            isAuction:        isAuction,
            exists:           true
        });
        emit ContentPublished(contentHash, msg.sender);
    }

    /// @notice Flat-rate purchase (non-auction)
    function purchaseLicense(bytes32 contentHash, uint256 expiresAt) external {
        Content storage c = contents[contentHash];
        require(c.exists && !c.isAuction, "Invalid purchase");
        // Transfer stablecoin from buyer
        stablecoin.transferFrom(msg.sender, address(this), c.licenseFee);
        // Record license
        licenses[contentHash][msg.sender] = License({
            distributor: msg.sender,
            purchasedAt: block.timestamp,
            expiresAt:   expiresAt
        });
        emit LicensePurchased(contentHash, msg.sender, c.licenseFee);
    }

    /// @notice (Optional) Auction bidding flow
    function placeBid(bytes32 contentHash, uint256 bidAmount) external {
        // TODO: implement auction logic
        emit AuctionBid(contentHash, msg.sender, bidAmount);
    }

    /// @notice Renew an existing license (if you want expirations)
    function renewLicense(bytes32 contentHash, uint256 newExpiry) external {
        License storage lic = licenses[contentHash][msg.sender];
        require(lic.distributor == msg.sender, "No license");
        // Could require a fee again, etc.
        lic.expiresAt = newExpiry;
        emit LicenseRenewed(contentHash, msg.sender, newExpiry);
    }

    /// @notice Publisher withdraws collected stablecoin
    function withdraw(address to, uint256 amount) external onlyPublisher(bytes32(0)) {
        // In practice, restrict to each publisher’s own content fees
        stablecoin.transfer(to, amount);
    }
}
```

---

## 2. DistributionRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract DistributionRegistry {
    // Records: contentHash => distributor => list of platform entries
    struct PlatformEntry {
        string  platform;    // e.g. "YouTube"
        string  url;         // e.g. "youtube.com/watch?v=abc"
        uint256 timestamp;
    }

    // contentHash => distributor => entries
    mapping(bytes32 => mapping(address => PlatformEntry[])) private _registry;

    event PlatformRegistered(
        bytes32 indexed contentHash,
        address indexed distributor,
        string platform,
        string url
    );

    /// @notice Called by distributor after uploading to a platform
    function registerPlatform(
        bytes32 contentHash,
        string calldata platform,
        string calldata url
    ) external {
        _registry[contentHash][msg.sender].push(
            PlatformEntry({
                platform:  platform,
                url:       url,
                timestamp: block.timestamp
            })
        );
        emit PlatformRegistered(contentHash, msg.sender, platform, url);
    }

    /// @notice Check if a given platform URL was registered by this distributor
    function isAuthorizedPublisher(
        bytes32 contentHash,
        address distributor,
        string calldata platform,
        string calldata url
    ) external view returns (bool) {
        PlatformEntry[] storage entries = _registry[contentHash][distributor];
        for (uint i = 0; i < entries.length; i++) {
            if (
                keccak256(bytes(entries[i].platform)) == keccak256(bytes(platform)) &&
                keccak256(bytes(entries[i].url))      == keccak256(bytes(url))
            ) {
                return true;
            }
        }
        return false;
    }
}
```

---

## 3. BountyPool.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Simplified interface to Reclaim Protocol verifier
interface IReclaimVerifier {
    function verifyZkTLS(bytes calldata proof) external returns (bool);
}

contract BountyPool {
    IERC20 public immutable stablecoin;
    IReclaimVerifier public immutable verifier;

    // contentHash => total bounty pool (in stablecoin)
    mapping(bytes32 => uint256) public bountyPools;

    struct Claim {
        address hunter;
        string  platform;
        string  url;
        bytes   zkProof;
        bool    processed;
        bool    valid;
    }

    // contentHash => list of claims
    mapping(bytes32 => Claim[]) public claims;

    event BountyFunded(bytes32 indexed contentHash, uint256 amount);
    event ClaimSubmitted(bytes32 indexed contentHash, uint256 claimIndex, address hunter);
    event ClaimProcessed(bytes32 indexed contentHash, uint256 claimIndex, bool valid, uint256 reward);

    constructor(address _stablecoin, address _verifier) {
        stablecoin = IERC20(_stablecoin);
        verifier   = IReclaimVerifier(_verifier);
    }

    /// @notice Fund the bounty pool from LicenseRegistry when a license is purchased
    function fundBounty(bytes32 contentHash, uint256 amount) external {
        // Ideally only callable by LicenseRegistry
        stablecoin.transferFrom(msg.sender, address(this), amount);
        bountyPools[contentHash] += amount;
        emit BountyFunded(contentHash, amount);
    }

    /// @notice Hunter submits a zkTLS proof of takedown on a platform
    function submitClaim(
        bytes32 contentHash,
        string calldata platform,
        string calldata url,
        bytes calldata zkProof
    ) external {
        claims[contentHash].push(Claim({
            hunter:    msg.sender,
            platform:  platform,
            url:       url,
            zkProof:   zkProof,
            processed: false,
            valid:     false
        }));
        emit ClaimSubmitted(contentHash, claims[contentHash].length - 1, msg.sender);
    }

    /// @notice Process a pending claim: verify proof and pay reward if valid
    function processClaim(bytes32 contentHash, uint256 index) external {
        Claim storage c = claims[contentHash][index];
        require(!c.processed, "Already processed");

        bool ok = verifier.verifyZkTLS(c.zkProof);
        c.processed = true;
        c.valid     = ok;

        uint256 reward = 0;
        if (ok) {
            // Simple equal-split among valid claims; you could weight by complexity or timestamp
            uint256 pool = bountyPools[contentHash];
            reward = pool / 10;            // e.g. 10% per valid claim, or dynamic split
            bountyPools[contentHash] -= reward;
            stablecoin.transfer(c.hunter, reward);
        }

        emit ClaimProcessed(contentHash, index, ok, reward);
    }
}
```

---

### Next Steps

1. **Access Control & Security**

   * Lock down `fundBounty` to only your `LicenseRegistry`.
   * Consider rate-limiting `processClaim` or requiring on-chain arbitration.

2. **Auction Logic**

   * In `LicenseRegistry`, add bid tracking, highest-bid logic, and finalization.

3. **Rebate Payouts**

   * You can extend `LicenseRegistry` to push distributor rebates on upload proofs.

4. **Integration**

   * Wire `LicenseRegistry.purchaseLicense` → `BountyPool.fundBounty` in your deployment script.
   * Deploy Reclaim Protocol’s verifier or link its address.

