<template>
    <b-alert v-model="isModalUnstakedLiquidityShown" variant="primary" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        You have unstaked liquidity!
        <b-link @click="$emit('change-tab', 0)"> Stake my liquidity </b-link>
    </b-alert>
    <b-alert v-model="isModalInsufficientAmountShown" variant="primary" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        We require a minimal amount worth $3.00 USDC to be locked.
    </b-alert>
    <BaseFormGroupLockAmount :value="value" @update="$emit('update-amount', parseUnits(String($event), 18))" />
    <BaseFormGroupLockEnd :value="lockEnd" @update="lockEnd = $event" />
    <b-button
        :disabled="isInsufficientAmount"
        class="w-100 mt-3"
        :variant="!Number(amount) ? 'primary' : 'success'"
        @click="isModalDepositShown = true"
    >
        Deposit
    </b-button>
    <BaseModalDeposit
        :amount="value"
        :lock-end="lockEnd"
        :show="isModalDepositShown"
        @hidden="isModalDepositShown = false"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { NinetyDaysInMs, getThursdaysUntilTimestamp } from '../../utils/date';
import { ChainId } from '@thxnetwork/sdk';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

export default defineComponent({
    name: 'BaseTabDeposit',
    props: {
        amount: { type: String, required: true },
    },
    data() {
        return {
            parseUnits,
            isModalDepositShown: false,
            isAlertDepositShown: true,
            isModalWithdrawShown: false,
            lockEnd: new Date(),
            minBPTGValue: parseUnits('3', 'ether'),
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        value() {
            if (!this.amount) return 0;
            return Number(formatUnits(this.amount, 'ether'));
        },
        isModalUnstakedLiquidityShown() {
            if (!this.walletStore.balances[this.address.BPT]) return false;
            return BigNumber.from(this.walletStore.balances[this.address.BPT]).gt(0);
        },
        isModalInsufficientAmountShown() {
            const bptPriceInWei = parseUnits(String(this.liquidityStore.pricing['20USDC-80THX']), 18);
            const bptValue = BigNumber.from(this.amount).mul(bptPriceInWei);
            return bptValue.lt(this.minBPTGValue) && bptValue.gt(0);
        },
        isInsufficientAmount() {
            const bptPriceInWei = parseUnits(String(this.liquidityStore.pricing['20USDC-80THX']), 18);
            const bptValue = BigNumber.from(this.amount).mul(bptPriceInWei);
            return bptValue.lt(this.minBPTGValue);
        },
    },
    watch: {
        'veStore.now'(now) {
            const [firstDate] = getThursdaysUntilTimestamp(now, now + NinetyDaysInMs);
            this.lockEnd = new Date(firstDate);
        },
    },
});
</script>
