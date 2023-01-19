/**
 * SPDX-License-Identifier: MIT
 * @author Accubits
 * @title BAIR Token
 */

pragma solidity 0.8.17;

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

/**
 * @title  BAIR Token
 * @dev    BEP20 token on the binance blockchain network.
 *
 * Ownership will be transferred to the owner address creation
 * at the end of initialise function.
 *
 * Features:
 * Owner can mint,burn,pause and unpause
 * Anti-Bot features such as Whitelisting accounts, Maximum account balance limt and Maximum transaction limit
 */

contract BAIRTokenV2 is
  Initializable,
  ERC20Upgradeable,
  ERC20BurnableUpgradeable,
  PausableUpgradeable,
  OwnableUpgradeable
{
  ///to store decimal.
  uint8 private _decimals;
  ///Maximum transaction limit token amount.
  uint256 private _transactionLimit;
  ///Maximum wallet balance limit token amount.
  uint256 private _walletBalanceLimit;
  ///Anti-Bot protection status.
  bool private _antiBotProtection;
  ///Whitelisted accounts.
  mapping(address => bool) public isWhiteListed;

 ///Emitted Maximum wallet balance limit updated.
  event MaximumWalletBalanceUpdated(
    uint256 limit
  );

 ///Emitted Maximum transaction limit updated.
  event MaximumTransactionLimitUpdated(
    uint256 limit
  );

 ///Emitted when Anti-Bot protection status updated.
  event AntiBotProtectionUpdated(
    bool status
  );

  ///Emitted when whitelist updated.
  event WhiteListUpdated(
    bool added,
    address[] members
  );

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @dev     To initialize the contract.
   * @param   name_  BEP20 token name.
   * @param   symbol_  BEP20 token symbol.
   * @param   totalSupply_  BEP20 token initial supply.
   * @param   decimals_  BEP20 decimal allows.
   * @param   owner_  BEP20 token owner address.
   * @param   transactionLimit_  Token amount to set transaction limit.
   * @param   walletBalanceLimit_  Token amount to set wallet balance limit.
   * @param   antiBotProtection_  Flag(true/false) to on or off antibot protection.
   */
  function initialize(
    string memory name_,
    string memory symbol_,
    uint256 totalSupply_,
    uint8 decimals_,
    address owner_,
    uint256 transactionLimit_,
    uint256 walletBalanceLimit_,
    bool antiBotProtection_
  ) public initializer {
    __ERC20_init(name_, symbol_);
    __ERC20Burnable_init();
    __Pausable_init();
    __Ownable_init();

    isWhiteListed[owner_] = true;
    isWhiteListed[address(this)] = true;

    _antiBotProtection = antiBotProtection_;
    _walletBalanceLimit = walletBalanceLimit_;
    _transactionLimit = transactionLimit_;
    _decimals = decimals_;
    totalSupply_ = totalSupply_;

    _mint(owner_, totalSupply_);
    _transferOwnership(owner_);
    emit AntiBotProtectionUpdated(antiBotProtection_);
    emit MaximumTransactionLimitUpdated(transactionLimit_);
    emit MaximumWalletBalanceUpdated(walletBalanceLimit_);
  }

  /**
   * @dev  Function to enable or disable anti-bot protection.
   * @param   control  Bool.
   */
  function toggleAntiBotProtection(bool control) external onlyOwner {
    _antiBotProtection = control;
    emit AntiBotProtectionUpdated(_antiBotProtection);
  }

  /**
   * @dev     Function to retrieve anti-bot protection status.
   * @return  bool  Status.
   */
  function getAntiBotProtectionStatus() external view returns (bool) {
    return _antiBotProtection;
  }

  /**
   * @dev     Function to whitelist addresses.
   * @param   addresses  Array of addresses.
   */
  function addToWhiteList(address[] memory addresses) external onlyOwner {
    for (uint256 i = 0; i < addresses.length; i++) {
      isWhiteListed[addresses[i]] = true;
    }
    emit WhiteListUpdated(true, addresses);
  }

  /**
   * @dev     Function to remove accounts from whitelist.
   * @param   addresses  Array of addresses.
   */
  function removeFromWhiteList(address[] memory addresses) external onlyOwner {
    for (uint256 i = 0; i < addresses.length; i++) {
      isWhiteListed[addresses[i]] = false;
    }
    emit WhiteListUpdated(false, addresses);

  }

  /**
   * @dev     Overriding the inherited function transferFrom to include anti-bot protection.
   * @param   to  Address to which token amount is received.
   * @param   amount  Token amount to be transfer.
   */
  function _antiBotValidation(
    address to,
    uint256 amount
  ) internal view{

    if (_antiBotProtection && _msgSender() != owner()) {
      require(
        isWhiteListed[_msgSender()] && isWhiteListed[to],
        'Transactions disabled for these accounts.'
      );
      require(
        amount <= _transactionLimit,
        'Transaction limit exceeded : Please send lesser amounts.'
      );
      require(
        (balanceOf(to) + amount) <= _walletBalanceLimit,
        'Exceeding maximum wallet balance : Please send lesser amounts.'
      );
    }
  }

  /**
   * @dev     Function to set maximum transaction amount.
   * @param   amount  Token amount.
   */
  function setTransactionLimit(uint256 amount) external onlyOwner {
    _transactionLimit = amount;
    emit MaximumTransactionLimitUpdated(amount);

  }

  /**
   * @dev     Function to retrieve current transaction limit.
   * @return  uint256  Transaction limit.
   */
  function getTransactionLimit() external view returns (uint256) {
    return _transactionLimit;
  }

  /**
   * @dev     Function to set maximum wallet balance.
   * @param   amount  Token amount.
   */
  function setWalletBalanceLimit(uint256 amount) external onlyOwner {
    _walletBalanceLimit = amount;
    emit MaximumWalletBalanceUpdated(amount);

  }

  /**
   * @dev     Function to retrieve current wallet balance limit.
   * @return  uint256  Wallet balance limit.
   */
  function getWalletBalanceLimit() external view returns (uint256) {
    return _walletBalanceLimit;
  }

  /**
   * @dev     Overriding inherited function decimal.
   * @return  uint8  Decimal
   */
  function decimals() public view virtual override returns (uint8) {
    return _decimals;
  }

  /**
   * @dev     External function to invoke function _pause
   *          Only owner can pause the transactions.
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * @dev     External function to invoke _unpause
   *          Only owner can unpause the transactions.
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  /**
   * @dev     Overriding inherited hook
   * @param   from  Address from which token amount is transfer.
   * @param   to  Address to which token amount is received.
   * @param   amount  Token amount to be transfer.
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override whenNotPaused {
    super._beforeTokenTransfer(from, to, amount);
    // _antiBotValidation(to,amount);
  }
}
