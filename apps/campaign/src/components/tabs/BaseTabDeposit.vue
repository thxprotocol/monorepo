<template>
    <b-alert v-model="isModalUnstakedLiquidityShown" variant="primary" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        You hold unstaked liquidity!
        <b-link @click="isModalStakeShown = true"> Stake your liquidity first</b-link>
        <i
            v-b-tooltip
            class="fas fa-info-circle ms-1 text-opaque"
            title="You can only lock and obtain veTHX after staking your provided liquidity."
        />
    </b-alert>
    <BaseModalStake
        :show="isModalStakeShown"
        :amount="formatUnits(balanceBPT.toString(), 18)"
        @hidden="isModalStakeShown = false"
    />
    <b-alert v-model="isModalInsufficientAmountShown" variant="primary" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        We require a minimal amount worth $3.00 USDC to be locked.
    </b-alert>
    <BaseFormGroupLockAmount :value="value" @update="$emit('update-amount', parseUnits(String($event), 18))" />
    <BaseFormGroupLockEnd :value="lockEnd" @update="lockEnd = $event" />
    <b-button
        v-if="!accountStore.isAuthenticated"
        class="w-100 mt-3"
        variant="primary"
        @click="authStore.isModalLoginShown = true"
    >
        Sign in &amp; Deposit
    </b-button>
    <b-button
        v-else
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
import { useAuthStore } from '@thxnetwork/campaign/stores/Auth';

export default defineComponent({
    name: 'BaseTabDeposit',
    props: {
        amount: { type: String, required: true },
    },
    data() {
        return {
            parseUnits,
            formatUnits,
            isModalStakeShown: false,
            isModalDepositShown: false,
            isAlertDepositShown: true,
            isModalWithdrawShown: false,
            lockEnd: new Date(),
            minBPTGValue: parseUnits('3', 'ether'),
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useAuthStore, useVeStore, useLiquidityStore),
        amountStake() {
            return this.balanceBPT;
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return BigNumber.from(0);
            return BigNumber.from(this.walletStore.balances[this.address.BPT]);
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        value() {
            if (!this.amount) return 0;
            return Number(formatUnits(this.amount, 'ether'));
        },
        isModalUnstakedLiquidityShown() {
            return this.balanceBPT.gt(0);
        },
        isModalInsufficientAmountShown() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return false;
            const bptPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
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
