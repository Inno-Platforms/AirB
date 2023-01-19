const { ethers, upgrades } = require('hardhat');
require('dotenv').config();

const { MULTI_WALLET } = process.env;

async function main() {
  console.log('Transferring ownership of ProxyAdmin...');
  // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(MULTI_WALLET);
  console.log('Transferred ownership of ProxyAdmin to:', MULTI_WALLET);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
