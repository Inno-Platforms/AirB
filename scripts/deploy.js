// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades, run } = require('hardhat');
require('dotenv').config();

const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_SUPPLY,
  TOKEN_DECIMALS,
  OWNER,
  TXN_LIMIT,
  WALLET_BALANCE_LIMIT,
  ANTI_BOT_PROTECTION,
  WAIT_BLOCK_CONFIRMATIONS,
} = process.env;

async function main() {
  const BAIRToken = await ethers.getContractFactory('BAIRToken');
  console.log('Deploying BAIR Token...');
  const BAIR = await upgrades.deployProxy(
    BAIRToken,
    [
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_SUPPLY,
      TOKEN_DECIMALS,
      OWNER,
      TXN_LIMIT,
      WALLET_BALANCE_LIMIT,
      ANTI_BOT_PROTECTION,
    ],
    {
      initializer: 'initialize',
    }
  );

  console.log(`Waiting for ${WAIT_BLOCK_CONFIRMATIONS} blocks confirmations....`);
  await BAIR.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

  console.log('Deployed Proxy address:', BAIR.address);

  console.log('Verifying contracts....');

  await run(`verify:verify`, {
    address: BAIR.address,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
