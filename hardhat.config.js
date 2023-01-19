require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('@openzeppelin/hardhat-defender');
require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-chai-matchers');

const {
  INFURA_KEY,
  ETHERSCAN_KEY,
  BSCSCAN_KEY,
  MNEMONIC,
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET_KEY,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      // accounts: { mnemonic: MNEMONIC },
      // 	chainId: 1337,
      forking: {
        url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/` + INFURA_KEY,
      accounts: { mnemonic: MNEMONIC },
      chainId: 1,
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/' + INFURA_KEY,
      accounts: { mnemonic: MNEMONIC },
      chainId: 5,
    },
    bsc: {
      url: 'https://bsc-dataseed1.binance.org',
      accounts: { mnemonic: MNEMONIC },
      chainId: 56,
    },
    bscTestnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: { mnemonic: MNEMONIC },
      chainId: 97,
    },
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_KEY,
      goerli: ETHERSCAN_KEY,
      bsc: BSCSCAN_KEY,
      bscTestnet: BSCSCAN_KEY,
    },
  },
  defender: {
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET_KEY,
  },
};
