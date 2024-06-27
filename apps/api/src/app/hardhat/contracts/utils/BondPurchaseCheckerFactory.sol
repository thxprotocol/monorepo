// SPDX-License-Identifier: Apache-2.0
pragma abicoder v2;
pragma solidity ^0.7.6;

import './BondPurchaseChecker.sol';

contract BondPurchaseCheckerFactory {
    function deploy(address bondAddress) public returns (BondPurchaseChecker) {
        return new BondPurchaseChecker(bondAddress);
    }
}
