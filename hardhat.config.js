/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1, // Minimize deployment cost and contract size
      },
      viaIR: true, // Enable IR compilation for complex contracts
      metadata: {
        bytecodeHash: "none", // Reduce contract size
        appendCBOR: false, // Remove metadata CBOR
      },
      debug: {
        revertStrings: "strip", // Remove revert strings to save space
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 