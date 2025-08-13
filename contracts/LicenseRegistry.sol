// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LicenseRegistry
 * @dev Contract for managing content licenses and platform registrations
 */
contract LicenseRegistry {
    
    struct License {
        address distributor;
        uint256 contentId;
        uint256 purchasePrice;
        uint256 purchaseTimestamp;
        uint256 expirationTimestamp;
        bool isActive;
    }
    
    struct PlatformRegistration {
        address distributor;
        uint256 contentId;
        string platform;
        string contentUrl;
        string platformContentId;
        uint256 registrationTimestamp;
        bool isVerified;
    }
    
    // State variables
    address public coreContract;
    uint256 public registrationCounter;
    
    // Mappings
    mapping(uint256 => mapping(address => License)) public licenses; // contentId => distributor => License
    mapping(uint256 => address[]) public contentDistributors; // contentId => distributors[]
    mapping(address => uint256[]) public distributorContent; // distributor => contentIds[]
    mapping(uint256 => PlatformRegistration) public platformRegistrations; // registrationId => PlatformRegistration
    mapping(uint256 => uint256[]) public contentPlatformRegistrations; // contentId => registrationIds[]
    mapping(address => uint256[]) public distributorRegistrations; // distributor => registrationIds[]
    
    // Events
    event LicenseRegistered(
        uint256 indexed contentId,
        address indexed distributor,
        uint256 price,
        uint256 expirationTimestamp
    );
    
    event LicenseRevoked(
        uint256 indexed contentId,
        address indexed distributor,
        string reason
    );
    
    event PlatformRegistered(
        uint256 indexed registrationId,
        uint256 indexed contentId,
        address indexed distributor,
        string platform,
        string contentUrl
    );
    
    event PlatformRegistrationVerified(
        uint256 indexed registrationId,
        bool verified
    );
    
    // Modifiers
    modifier onlyCore() {
        require(msg.sender == coreContract, "Only core contract can call");
        _;
    }
    
    modifier onlyLicensedDistributor(uint256 contentId) {
        require(hasValidLicense(contentId, msg.sender), "Not a licensed distributor");
        _;
    }
    
    constructor(address _coreContract) {
        coreContract = _coreContract;
        registrationCounter = 0;
    }
    
    /**
     * @dev Register a new license (called by core contract)
     */
    function registerLicense(
        uint256 contentId,
        address distributor,
        uint256 price
    ) external onlyCore {
        require(!hasValidLicense(contentId, distributor), "License already exists");
        
        License storage license = licenses[contentId][distributor];
        license.distributor = distributor;
        license.contentId = contentId;
        license.purchasePrice = price;
        license.purchaseTimestamp = block.timestamp;
        license.expirationTimestamp = 0; // No expiration by default
        license.isActive = true;
        
        // Add to tracking arrays
        contentDistributors[contentId].push(distributor);
        distributorContent[distributor].push(contentId);
        
        emit LicenseRegistered(contentId, distributor, price, 0);
    }
    
    /**
     * @dev Register content on a platform
     */
    function registerPlatform(
        uint256 contentId,
        string calldata platform,
        string calldata contentUrl,
        string calldata platformContentId
    ) external onlyLicensedDistributor(contentId) returns (uint256) {
        registrationCounter++;
        uint256 registrationId = registrationCounter;
        
        PlatformRegistration storage registration = platformRegistrations[registrationId];
        registration.distributor = msg.sender;
        registration.contentId = contentId;
        registration.platform = platform;
        registration.contentUrl = contentUrl;
        registration.platformContentId = platformContentId;
        registration.registrationTimestamp = block.timestamp;
        registration.isVerified = false;
        
        // Add to tracking arrays
        contentPlatformRegistrations[contentId].push(registrationId);
        distributorRegistrations[msg.sender].push(registrationId);
        
        emit PlatformRegistered(
            registrationId,
            contentId,
            msg.sender,
            platform,
            contentUrl
        );
        
        return registrationId;
    }
    
    /**
     * @dev Verify platform registration (for bounty hunters to check)
     */
    function verifyPlatformRegistration(
        uint256 registrationId,
        bool verified
    ) external {
        // In a real implementation, this might be restricted to verified oracles or bounty hunters
        // For now, allowing anyone to verify for testing purposes
        platformRegistrations[registrationId].isVerified = verified;
        
        emit PlatformRegistrationVerified(registrationId, verified);
    }
    
    /**
     * @dev Check if distributor has valid license for content
     */
    function hasValidLicense(uint256 contentId, address distributor) public view returns (bool) {
        License storage license = licenses[contentId][distributor];
        
        if (!license.isActive) {
            return false;
        }
        
        // Check expiration if set
        if (license.expirationTimestamp > 0 && block.timestamp > license.expirationTimestamp) {
            return false;
        }
        
        return license.distributor == distributor;
    }
    
    /**
     * @dev Get license information
     */
    function getLicense(uint256 contentId, address distributor) 
        external 
        view 
        returns (License memory) 
    {
        return licenses[contentId][distributor];
    }
    
    /**
     * @dev Get all distributors for content
     */
    function getContentDistributors(uint256 contentId) 
        external 
        view 
        returns (address[] memory) 
    {
        return contentDistributors[contentId];
    }
    
    /**
     * @dev Get all content for distributor
     */
    function getDistributorContent(address distributor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return distributorContent[distributor];
    }
    
    /**
     * @dev Get platform registrations for content
     */
    function getContentPlatformRegistrations(uint256 contentId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return contentPlatformRegistrations[contentId];
    }
    
    /**
     * @dev Get platform registrations for distributor
     */
    function getDistributorRegistrations(address distributor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return distributorRegistrations[distributor];
    }
    
    /**
     * @dev Get platform registration details
     */
    function getPlatformRegistration(uint256 registrationId) 
        external 
        view 
        returns (PlatformRegistration memory) 
    {
        return platformRegistrations[registrationId];
    }
    
    /**
     * @dev Check if content is registered on platform by any licensed distributor
     */
    function isContentRegisteredOnPlatform(
        uint256 contentId,
        string calldata platform,
        string calldata platformContentId
    ) external view returns (bool, address) {
        uint256[] memory registrations = contentPlatformRegistrations[contentId];
        
        for (uint i = 0; i < registrations.length; i++) {
            PlatformRegistration storage reg = platformRegistrations[registrations[i]];
            
            if (
                keccak256(bytes(reg.platform)) == keccak256(bytes(platform)) &&
                keccak256(bytes(reg.platformContentId)) == keccak256(bytes(platformContentId)) &&
                hasValidLicense(contentId, reg.distributor)
            ) {
                return (true, reg.distributor);
            }
        }
        
        return (false, address(0));
    }
    
    /**
     * @dev Revoke license (emergency function)
     */
    function revokeLicense(
        uint256 contentId,
        address distributor,
        string calldata reason
    ) external onlyCore {
        require(hasValidLicense(contentId, distributor), "License does not exist");
        
        licenses[contentId][distributor].isActive = false;
        
        emit LicenseRevoked(contentId, distributor, reason);
    }
    
    /**
     * @dev Update core contract address (for upgrades)
     */
    function updateCoreContract(address newCoreContract) external {
        require(msg.sender == coreContract, "Not authorized");
        coreContract = newCoreContract;
    }
} 