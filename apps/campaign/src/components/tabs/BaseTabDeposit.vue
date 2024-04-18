<template>
    <BaseFormGroupLockAmount :value="Number(amount)" @update="amount = $event" />
    <BaseFormGroupLockEnd :value="lockEnd" class="mb-4" @update="lockEnd = $event" />
    <b-button
        v-if="!accountStore.isAuthenticated"
        class="w-100"
        variant="primary"
        @click="authStore.isModalLoginShown = true"
    >
        Sign in &amp; Lock Liquidity
    </b-button>
    <BaseButtonApprove
        v-else-if="!isSufficientBPTGaugeAllowance"
        :amount="amount"
        :token="{ address: address.BPTGauge, decimals: 18 }"
        :spender="address.VotingEscrow"
        @success="onLiquidityLock"
    >
        Approve 20USDC-80THX
    </BaseButtonApprove>
    <BaseButtonLiquidityLock
        v-else
        :amount="parseUnits(amount, 18).toString()"
        :lock-end="lockEnd"
        @success="onLiquidityLock"
    >
        Lock Liquidity
    </BaseButtonLiquidityLock>
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
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/campaign/stores/Auth';
import { BigNumber } from 'ethers/lib/ethers';

export default defineComponent({
    name: 'BaseTabDeposit',
    data() {
        return {
            parseUnits,
            formatUnits,
            amount: '0',
            isAlertDepositShown: true,
            lockEnd: new Date(),
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useAuthStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        isSufficientBPTGaugeAllowance() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return false;
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            const amountInWei = parseUnits(this.amount, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
    },
    watch: {
        'walletStore.wallet'(wallet) {
            if (!wallet) return;
            this.walletStore.getBalance(this.address.BPTGauge).then(() => {
                this.amount = formatUnits(this.walletStore.balances[this.address.BPTGauge], 18);
            });
            this.walletStore.getApproval({ tokenAddress: this.address.BPTGauge, spender: this.address.VotingEscrow });
        },
        'veStore.now'(now) {
            const [firstDate] = getThursdaysUntilTimestamp(now, now + NinetyDaysInMs);
            this.lockEnd = new Date(firstDate);
        },
    },
    methods: {
        onLiquidityLock() {
            this.walletStore.getBalance(this.address.BPTGauge).then(() => {
                this.amount = formatUnits(this.walletStore.balances[this.address.BPTGauge], 18);
            });
        },
    },
});
</script>
