const { describe } = require('mocha');
const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');

const BN = ethers.BigNumber.from;

const {
  NAME,
  SYMBOL,
  TOTAL_SUPPLY,
  DECIMALS,
  TXN_LIMIT,
  WALLET_BALANCE_LIMIT,
  ANTI_BOT_PROTECTION,
  ZERO_ADDRESS,
} = require('./config/index.js');

describe('BAIR Token', () => {
  let owner, user1, user2, user3;
  let bairToken;
  const TOTAL_SUPPLY_BN = BN(TOTAL_SUPPLY);
  const DECIMAL_BN = BN(DECIMALS);
  const TOTAL_SUPPLY_BN_WEI = TOTAL_SUPPLY_BN.mul(BN(10).pow(DECIMAL_BN));
  const TXN_LIMIT_BN_WEI = BN(TXN_LIMIT).mul(BN(10).pow(DECIMAL_BN));
  const WALLET_BALANCE_LIMIT_BN_WEI = BN(WALLET_BALANCE_LIMIT).mul(BN(10).pow(DECIMAL_BN));

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const BAIRToken = await ethers.getContractFactory('BAIRToken');

    bairToken = await upgrades.deployProxy(BAIRToken, [
      NAME,
      SYMBOL,
      TOTAL_SUPPLY_BN_WEI,
      DECIMALS,
      owner.address,
      TXN_LIMIT_BN_WEI,
      WALLET_BALANCE_LIMIT_BN_WEI,
      ANTI_BOT_PROTECTION,
    ]);
    await bairToken.toggleAntiBotProtection(false);
  });

  describe('Deployment', async () => {
    it('Ownership transferred from deployer to owner', async () => {
      const result = await bairToken.owner();
      expect(result).to.equal(owner.address);
    });
  });

  describe('Metadata', () => {
    it('Token metadata is correct', async () => {
      expect(await bairToken.name()).to.equal(NAME);
      expect(await bairToken.symbol()).to.equal(SYMBOL);
      expect(await bairToken.decimals()).to.equals(Number(DECIMALS));
      expect((await bairToken.totalSupply()).eq(TOTAL_SUPPLY_BN_WEI)).is.true;
      expect((await bairToken.getTransactionLimit()).eq(TXN_LIMIT_BN_WEI)).is.true;
      expect((await bairToken.getWalletBalanceLimit()).eq(WALLET_BALANCE_LIMIT_BN_WEI)).is.true;
      expect(await bairToken.getAntiBotProtectionStatus()).is.false;
    });
  });

  describe('Balance', () => {
    it('Users can check their balance', async () => {
      expect((await bairToken.balanceOf(user1.address)).eq(BN(0))).is.true;

      const amountToSendBN = BN(100).mul(BN(10).pow(DECIMAL_BN));
      //admin to user1.address
      await bairToken.transfer(user1.address, amountToSendBN);
      expect((await bairToken.balanceOf(user1.address)).eq(amountToSendBN)).is.true;
    });
  });

  describe('Transfer', () => {
    it('Initial supply minted and transferred to owner', async () => {
      expect((await bairToken.balanceOf(owner.address)).eq(TOTAL_SUPPLY_BN_WEI)).is.true;
    });

    it('Users can transfer tokens to other users', async () => {
      const amountToSendBN = BN(100).mul(BN(10).pow(DECIMAL_BN));
      //admin to user1.address
      await bairToken.transfer(user1.address, amountToSendBN);
      expect((await bairToken.balanceOf(user1.address)).eq(amountToSendBN)).is.true;
      //user1.address to user2.address
      await bairToken.connect(user1).transfer(user2.address, amountToSendBN);
      expect((await bairToken.balanceOf(user2.address)).eq(amountToSendBN)).is.true;
    });

    it('Event emitted when tokens are transferred', async () => {
      const amountToSendBN = BN(100).mul(BN(10).pow(DECIMAL_BN));
      await expect(bairToken.transfer(user1.address, amountToSendBN))
        .to.emit(bairToken, 'Transfer')
        .withArgs(owner.address, user1.address, amountToSendBN);
    });

    it('Reverts if user tries to transfer tokens without enough balance', async () => {
      const amountToSendBN = BN(100).mul(BN(10).pow(DECIMAL_BN));
      await expect(
        bairToken.connect(user3).transfer(user2.address, amountToSendBN)
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('Reverts if user tries to transfer tokens to zero address', async () => {
      const amountToSendBN = BN(10).mul(BN(10).pow(DECIMAL_BN));
      await expect(
        bairToken.connect(user1).transfer(ZERO_ADDRESS, amountToSendBN)
      ).to.be.revertedWith('ERC20: transfer to the zero address');
    });
  });

  describe('Allowance', () => {
    it('Users can check their allowance', async () => {
      expect((await bairToken.allowance(owner.address, user1.address)).eq(BN(0)));

      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      //approving allowance
      await bairToken.approve(user1.address, amountToSendBN);
      //checking allowance
      expect((await bairToken.allowance(owner.address, user1.address)).eq(amountToSendBN));
    });

    it('Approve transfer of available tokens by third-party', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      const balanceOfOwner = await bairToken.balanceOf(owner.address);
      const balanceOfUser1 = await bairToken.balanceOf(user1.address);
      const balanceOfUser2 = await bairToken.balanceOf(user2.address);
      //approving allowance
      await bairToken.approve(user1.address, amountToSendBN);
      //checking allowance

      expect((await bairToken.allowance(owner.address, user1.address)).eq(amountToSendBN));
      //verifying transaction of approved tokens
      await bairToken.connect(user1).transferFrom(owner.address, user2.address, amountToSendBN);

      expect((await bairToken.balanceOf(owner.address)).eq(balanceOfOwner.sub(amountToSendBN)));

      expect((await bairToken.balanceOf(user1.address)).eq(balanceOfUser1));

      expect((await bairToken.balanceOf(user2.address)).eq(balanceOfUser2.add(amountToSendBN)));
    });

    it('Event emitted someone approves transfer of available tokens by third-party', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));

      await expect(bairToken.approve(user1.address, amountToSendBN))
        .to.emit(bairToken, 'Approval')
        .withArgs(owner.address, user1.address, amountToSendBN);
    });

    it('Increase allowance', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      const increasedAmountBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      await bairToken.approve(user1.address, amountToSendBN);
      expect((await bairToken.allowance(owner.address, user1.address)).eq(amountToSendBN));
      await bairToken.increaseAllowance(user1.address, increasedAmountBN);
      expect(
        (await bairToken.allowance(owner.address, user1.address)).eq(
          amountToSendBN.add(increasedAmountBN)
        )
      );
    });

    it('Decrease allowance', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      const increasedAmountBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      await bairToken.approve(user1.address, amountToSendBN);
      expect((await bairToken.allowance(owner.address, user1.address)).eq(amountToSendBN));
      await bairToken.increaseAllowance(user1.address, increasedAmountBN);
      expect(
        (await bairToken.allowance(owner.address, user1.address)).eq(
          amountToSendBN.sub(increasedAmountBN)
        )
      );
    });

    it('Revert when trying to approve unavailable tokens by third-party', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      //approving allowance
      await bairToken.connect(user1).approve(user2.address, amountToSendBN);
      //checking allowance
      expect((await bairToken.allowance(user1.address, user2.address)).eq(amountToSendBN));
      //verifying transaction of approved tokens
      await expect(
        bairToken.connect(user2).transferFrom(user1.address, user3.address, amountToSendBN)
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
    });

    it('Revert when trying to transfer more than allowed tokens by third-party', async () => {
      const amountToSendBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      //approving allowance
      await bairToken.approve(user1.address, amountToSendBN);
      //checking allowance
      expect((await bairToken.allowance(owner.address, user1.address)).eq(amountToSendBN));
      //verifying transaction of approved tokens
      await expect(
        bairToken
          .connect(user1)
          .transferFrom(owner.address, user2.address, amountToSendBN.add(BN(1000)))
      ).to.be.revertedWith('ERC20: insufficient allowance');
    });
  });

  describe('Ownership', () => {
    it('Transferring ownership', async () => {
      await bairToken.transferOwnership(user1.address);
      expect(await bairToken.owner()).to.equal(user1.address);
    });

    it('Event emitted on transferring ownership', async () => {
      await expect(bairToken.transferOwnership(user1.address))
        .to.emit(bairToken, 'OwnershipTransferred')
        .withArgs(owner.address, user1.address);
    });

    it('Revert when some user other than owner tries to transfer ownership', async () => {
      await expect(bairToken.connect(user2).transferOwnership(user1.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });

    it('Renounce ownership', async () => {
      await bairToken.renounceOwnership();
      expect(await bairToken.owner()).to.not.equal(owner.address);
    });

    it('Revert when some user other than owner tries to renounce ownership', async () => {
      await expect(bairToken.connect(user2).renounceOwnership()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('Burn', () => {
    it('Users can burn their own tokens', async () => {
      const amountToBurnBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      const ownerInitBalanceBN = await bairToken.balanceOf(owner.address);

      await bairToken.burn(amountToBurnBN);
      expect((await bairToken.balanceOf(owner.address)).eq(ownerInitBalanceBN.sub(amountToBurnBN)))
        .is.true;
    });

    it('Reverts when users tries to burn unavailable tokens', async () => {
      const amountToBurnBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      await expect(bairToken.connect(user1).burn(amountToBurnBN)).to.be.revertedWith(
        'ERC20: burn amount exceeds balance'
      );
    });

    it('Users can burn allowed tokens from another user', async () => {
      const allowanceAmountBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      const amountToBurnBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      const ownerInitBalanceBN = await bairToken.balanceOf(owner.address);
      await bairToken.approve(user1.address, allowanceAmountBN);
      expect((await bairToken.allowance(owner.address, user1.address)).eq(allowanceAmountBN));
      await bairToken.connect(user1).burnFrom(owner.address, amountToBurnBN);
      expect((await bairToken.balanceOf(owner.address)).eq(ownerInitBalanceBN.sub(amountToBurnBN)))
        .is.true;
      expect(
        (await bairToken.allowance(owner.address, user1.address)).eq(
          allowanceAmountBN.sub(amountToBurnBN)
        )
      );
    });

    it('Reverts when users tries to burn tokens more than allowed', async () => {
      const allowanceAmountBN = BN(500).mul(BN(10).pow(DECIMAL_BN));
      const amountToBurnBN = BN(1000).mul(BN(10).pow(DECIMAL_BN));
      await bairToken.approve(user1.address, allowanceAmountBN);
      expect((await bairToken.allowance(owner.address, user1.address)).eq(allowanceAmountBN));
      await expect(
        bairToken.connect(user1).burnFrom(owner.address, amountToBurnBN)
      ).to.be.revertedWith('ERC20: insufficient allowance');
    });
  });

  describe('Pause', () => {
    it('Owner can pause and unpause the contract', async () => {
      expect(await bairToken.paused()).is.false;
      await bairToken.pause();
      expect(await bairToken.paused()).is.true;
      await bairToken.unpause();
      expect(await bairToken.paused()).is.false;
    });

    it('Transactions are not allowed while contract is paused', async () => {
      const amountToSendBN = BN(100).mul(BN(10).pow(DECIMAL_BN));
      expect(await bairToken.paused()).is.false;
      await bairToken.pause();
      await expect(bairToken.transfer(user1.address, amountToSendBN)).to.be.revertedWith(
        'Pausable: paused'
      );
    });
  });
});
