## Contracts

### BAIRToken Contract

This is a solidity language, BEP-20 standard binance token and ERC-20 standard Ethereum Token contract, it means we can deploy these token on ethereum as well as binance network. It has mintable and burnable, with owner access permissions and pausable module, also it is upgradeable contract.

## Contracts deploy by hardhat-upgrades

### Proxy admin

A ProxyAdmin is a contract that acts as the owner of all your proxies. Only one per network gets deployed. When you start your project, the ProxyAdmin is owned by the deployer address, but you can transfer ownership of it by calling transferOwnership.

### Transparent Upgradeable Proxy

A proxy is a contract that delegates all of its calls to a second contract, named an implementation contract. All state and funds are held in the proxy, but the code actually executed is that of the implementation. A proxy can be upgraded by its admin to use a different implementation contract.

## Tools and Framework

### Git

Git is software for tracking changes in any set of files, usually used for coordinating work among programmers collaboratively developing source code during software development. Its goals include speed, data integrity, and support for distributed, non-linear workflows.

### Hardhat

Hardhat is a world-class development environment, testing framework and asset pipeline for blockchains using the Ethereum Virtual Machine (EVM), aiming to make life as a developer easier. We use hardhat in this project to compile and deploy the BAIR contracts in specified network

## Prerequisite

### Install Git

Run below commands

```bash
    sudo apt install git-all
```

### Install NodeJS

Run below commands

```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x |sudo -E bash -
    sudo apt-get install -y nodejs
```

### Install hardhat

Run below commands

```bash
    sudo npm install hardhat -g
```

## Versions used

- Ubuntu - 22.04.1 LTS
- Git - 2.34.1
- NodeJs - v16.18.0
- Node Package Manager(NPM) - 8.19.2
- Hardhat - 2.12.4
- Solidity - 0.8.4

## Initial Setup

1. Clone BAIR Contract Repo from https://gitlab.com/coinfactory/erc20-token-contract.git
2. Open Terminal in the Contract project folder and run `npm install` to install the dependencies.

## Contract Testing (optional)

1. Open Terminal in the BAIR Contract project folder.
2. Run `npx hardhat compile` or `hh compile` or `npm run compile` to compile the contracts
3. Run `npx hardhat test` or `hh test` or `npm run test` to run the Contract test cases
4. Test report will be generated in both JSON and HTML formats `./mochawesome-report/BairToken-Test-Report.json`

   `./mochawesome-report/BairToken-Test-Report.html`

## Configurations

### Environment variables

In order to compile and deploy the contract, there are certain values to be set in environment variable. Make a copy of `.env.sample` and rename it as `.env` Create a new `.env` file and put :

1. INFURA_KEY Infura API Key,
2. ETHERSCAN_KEY if you work on ethereum and want to verify contract on ethereum network.
3. BSCSCAN_KEY if you work on binance network and want to verify on binance network.
4. TOKEN_NAME Name of token.
5. TOKEN_SYMBOL Symbol of token.
6. TOKEN_SUPPLY Total initial supply.
7. TOKEN_DECIMALS Number of decimals used.
8. OWNER Owner wallet address.
9. TXN_LIMIT Maximum transaction amount(Anti-Bot).
10. WALLET_BALANCE_LIMIT Maximum wallet balance(Anti-Bot)..
11. ANTI_BOT_PROTECTION To toggle anti-bot features on and off.
12. DEFENDER_TEAM_API_KEY Openzeppelin Defender Team API Key for handling admin proposals.
13. DEFENDER_TEAM_API_SECRET_KEY Openzeppelin Defender Team API Key for handling admin proposals.
14. MULTI_WALLET Multi Signature wallet address for ProxyAdmin ownership.
15. EXISTING_ADDRESS Deployed proxy address for upgrading the contract.

Before starting this section we will understand about .openzeppelin folder. This folder contain set of json files with network names as file name with contents being the contract addresses deployed under that network. This file is one of the key file to track contract deployment and perform change/upgrade.

## Deployment

1. Make sure contract contract configurations are correct
2. Set the environment variables as required
3. Deploy contract with below commands

   `hh run scripts/deploy.js --network network_name`

   `hh run scripts/transfer-ownership.js`

   where network_name = development, bsc_testnet, bsc, polygon_mainnet, live etc.

### Verifying contract (hardhat-etherscan)

A Hardhat plugin that can be used to automatically verify your contracts through the Etherscan API. With this plugin you can verify your contracts with just a simple command:

`hh verify --network network_name ContractName `

## Upgrading contract

1. Create a copy of contract you intend to modify. name it as easy it is to understand.
2. Write the changes in the new file we copied and also rename the class in the similar pattern based on the new file name
3. After modifying the contract, We need to propose the upgrade. For that run

   ` hh run scripts/propose-upgrade.js`

   after adding the new contract name and existing proxy address

4. This will create a proposal for contract upgrade with a URL
5. The URL will direct to Openzeppelin Defender, with details of proposal.
6. Members of multi signature wallet can go there and approve or reject the upgrade.
7. Once it reaches enough approvals members can execute the upgrade.
8. For more details please visit: https://docs.openzeppelin.com/defender/guide-upgrades
