<template>
    <b-alert v-model="isAlertUnstakedLiquidityShown" class="p-2" variant="primary">
        <div><i class="fas fa-exclamation-circle me-1" /> <strong>You have unstaked 20USDC-80THX!</strong></div>
        Please, <b-link @click="$emit('change-tab', 1)">stake your 20USDC-80THX</b-link> before you lock.
    </b-alert>
    <BaseAlertErrorList :errors="errors" @close="errors.splice($event, 1)" />
    <BaseFormGroupLockAmount :value="Number(amount)" @update="amount = $event" />
    <BaseFormGroupLockEnd :value="lockEnd" class="mb-4" @update="lockEnd = $event" />
    <b-button
        v-if="!accountStore.isAuthenticated"
        class="w-100"
        variant="primary"
        @click="authStore.isModalLoginShown = true"
        @error="onError"
    >
        Sign in &amp; Lock <strong>20USDC-80THX</strong>
    </b-button>
    <BaseButtonApprove
        v-else-if="!isSufficientBPTGaugeAllowance"
        :amount="amount"
        :token="{ address: address.BPTGauge, decimals: 18 }"
        :spender="address.VotingEscrow"
        :disabled="!veStore.isAccepted"
        @error="onError"
    >
        Approve <strong>20USDC-80THX</strong> Transfer <span class="text-opaque">(1/2)</span>
    </BaseButtonApprove>
    <BaseButtonLiquidityLock
        v-else
        :amount="parseUnits(amount, 18).toString()"
        :lock-end="lockEnd"
        @success="onLiquidityLock"
        @error="onError"
    >
        Lock <strong>20USDC-80THX</strong> <span class="text-opaque">(2/2)</span>
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
import { ChainId } from '@thxnetwork/common/enums';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import { BigNumber } from 'ethers/lib/ethers';
import { parseError } from '@thxnetwork/app/utils/toast';
import { getThursdaysUntilTimestamp, NinetyDaysInMs } from '@thxnetwork/app/utils/date';

export default defineComponent({
    name: 'BaseTabDeposit',
    data() {
        return {
            parseUnits,
            formatUnits,
            amount: '0',
            errors: [] as string[],
            lockEnd: new Date(),
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useAuthStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.chainId) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.chainId];
        },
        isSufficientBPTGaugeAllowance() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return false;
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            const amountInWei = parseUnits(this.amount, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        isAlertUnstakedLiquidityShown() {
            return this.balanceBPT && !this.balanceBPTGauge;
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPT], 18)); // BPT has 18 decimals
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 18)); // BPT has 18 decimals
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                const balanceBPTGauge = this.walletStore.balances[this.address.BPTGauge];
                this.amount = balanceBPTGauge ? formatUnits(balanceBPTGauge, 18) : '0';
                this.walletStore.getApproval({
                    tokenAddress: this.address.BPTGauge,
                    spender: this.address.VotingEscrow,
                });
            },
            immediate: true,
        },
        'veStore.now': {
            handler(now) {
                const [firstDate] = getThursdaysUntilTimestamp(now, now + NinetyDaysInMs);
                this.lockEnd = new Date(firstDate);
            },
            immediate: true,
        },
    },
    methods: {
        onLiquidityLock() {
            this.amount = '0';
        },
        onError(error: Error) {
            this.errors.push(parseError(error));
        },
    },
});
</script>
