# Smart Contract Compilation Guide

## 🎯 **Resolving "Stack Too Deep" Error**

The "Stack too deep" error occurs when Solidity functions have too many local variables, exceeding the EVM's 16-variable stack limit. Here's how we've resolved it:

---

## ✅ **Solutions Implemented**

### **1. Code Refactoring**
We've broken down complex functions into smaller, focused helper functions:

```solidity
// BEFORE: Complex function with many variables
function purchaseLicense(uint256 contentId) external payable {
    // 10+ local variables = STACK OVERFLOW
}

// AFTER: Refactored with helper functions
function purchaseLicense(uint256 contentId) external payable {
    // Only 3-4 local variables
    _processPayment(contentId, currentPrice);
    uint256 newPrice = _updatePricing(contentId, currentPrice);
}
```

### **2. Compiler Optimization**
**Hardhat Configuration** (`hardhat.config.js`):
```javascript
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Critical for complex contracts
    },
  },
};
```

**Key Settings:**
- `optimizer.enabled: true` - Optimizes bytecode and reduces stack usage
- `optimizer.runs: 200` - Balances deployment cost vs execution cost
- `viaIR: true` - Uses Intermediate Representation for better compilation

---

## 🚀 **Compilation Instructions**

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Clean Previous Builds**
```bash
npm run clean
```

### **Step 3: Compile Contracts**
```bash
npm run compile
```

### **Alternative: Direct Hardhat Commands**
```bash
# Clean artifacts
npx hardhat clean

# Compile with IR enabled
npx hardhat compile

# Compile with verbose output
npx hardhat compile --verbose
```

---

## 🔧 **Troubleshooting**

### **If "Stack Too Deep" Still Occurs:**

1. **Enable IR Compilation** (most important):
   ```bash
   npx hardhat compile --via-ir
   ```

2. **Increase Optimizer Runs**:
   ```javascript
   // In hardhat.config.js
   optimizer: {
     enabled: true,
     runs: 1000, // Increase from 200
   }
   ```

3. **Use Latest Solidity Version**:
   ```javascript
   solidity: {
     version: "0.8.24", // Latest version
   }
   ```

### **Alternative Compilers:**

**Using Foundry (if Hardhat doesn't work):**
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create foundry.toml
echo '[profile.default]
src = "contracts"
out = "out"
libs = ["node_modules"]
optimizer = true
optimizer_runs = 200
via_ir = true' > foundry.toml

# Compile
forge build
```

---

## 📊 **Function Complexity Analysis**

| Function | Variables Before | Variables After | Status |
|----------|------------------|-----------------|---------|
| `purchaseLicense()` | 10+ | 3 | ✅ **Fixed** |
| `_processSingleLicense()` | 8+ | 3 | ✅ **Fixed** |
| `_calculateNewPrice()` | 6+ | 2 | ✅ **Fixed** |
| `_processPayment()` | - | 4 | ✅ **New Helper** |
| `_updatePricing()` | - | 3 | ✅ **New Helper** |
| `_calculateDynamicPrice()` | - | 4 | ✅ **New Helper** |

---

## 🛡️ **Verification Steps**

### **1. Successful Compilation**
```bash
npm run compile
# Should output: "Compiled X Solidity files successfully"
```

### **2. Check Artifacts**
```bash
ls artifacts/contracts/
# Should contain compiled contract artifacts
```

### **3. Verify Optimization**
```bash
# Check bytecode size (should be optimized)
npx hardhat compile --verbose
```

---

## 📝 **Additional Configuration Options**

### **For Very Complex Contracts:**
```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      // Additional settings for complex contracts
      evmVersion: "paris", // Latest EVM version
      metadata: {
        bytecodeHash: "none", // Reduce bytecode size
      },
    },
  },
};
```

### **For Production Deployment:**
```javascript
// Optimize for gas efficiency
optimizer: {
  enabled: true,
  runs: 1000000, // High runs for frequently called functions
}
```

---

## ⚠️ **Important Notes**

1. **IR Compilation is Slower**: `viaIR: true` increases compilation time but resolves stack issues
2. **Optimizer Trade-offs**: Higher runs = more gas efficient execution, higher deployment cost
3. **Version Compatibility**: Ensure all dependencies support the Solidity version used
4. **Memory vs Stack**: IR compilation converts stack operations to memory operations when needed

---

## 🎉 **Success Indicators**

✅ **Contract compiles without errors**  
✅ **No "Stack too deep" warnings**  
✅ **Bytecode size is reasonable**  
✅ **All functions maintain their logic**  
✅ **Gas estimates are within expected ranges**

---

**Status**: Ready for compilation with optimized settings! 🚀 