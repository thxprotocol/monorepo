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
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['20USDC-80THX']"
        :balance="balanceBPTGauge"
        :value="value"
        :min="minAmount"
        :max="balanceBPTGauge"
        class="mb-4"
        @update="$emit('update-amount', parseUnits(String($event), 18))"
    >
        <template #label>
            <div class="d-flex align-items-center">
                <b-img
                    src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                    alt="USDC icon"
                    width="20"
                    height="20"
                    class="me-2"
                />
                USDC <span class="text-opaque ms-1">20%</span>
                <b-img
                    src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                    alt="THX icon"
                    width="20"
                    height="20"
                    class="mx-2"
                />
                THX <span class="text-opaque ms-1">80%</span>
            </div>
        </template>
    </BaseFormGroupInputTokenAmount>
    <small class="text-opaque">{{ new Date(veStore.now) }}</small>
    <BaseFormGroupInputDate
        label="Lock duration"
        tooltip="The longer you lock, the more rewards you get. You will be able to withdraw early, but a penalty will be applied."
        :enable-time-picker="false"
        :min-date="minDate"
        :max-date="maxDate"
        :allowed-dates="allowedDates"
        :start-date="minDate"
        :value="lockEnd"
        @update="lockEnd = $event"
    >
        <template #description>
            <div class="d-flex justify-content-start">
                <b-button
                    v-for="{ timestamp, label } of suggestedDates"
                    size="sm"
                    variant="primary"
                    class="rounded-pill me-2 mt-2 mb-0"
                    :disabled="lockEnd.getTime() === timestamp"
                    @click="lockEnd = new Date(timestamp)"
                >
                    {{ label }}
                </b-button>
            </div>
        </template>
    </BaseFormGroupInputDate>
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
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 'ether'));
        },
        value() {
            if (!this.amount) return 0;
            return Number(formatUnits(this.amount, 'ether'));
        },
        minAmount() {
            if (!this.liquidityStore.pricing['20USDC-80THX']) return 0;
            const bptPriceInWei = parseUnits(String(this.liquidityStore.pricing['20USDC-80THX']), 18);
            return Number(formatUnits(this.minBPTGValue.div(bptPriceInWei), 18));
        },
        suggestedDates() {
            if (!this.allowedDates.length) return [];
            return [
                {
                    label: '2 Weeks',
                    timestamp: this.allowedDates[1],
                },
                {
                    label: '4 Weeks',
                    timestamp: this.allowedDates[3],
                },
                {
                    label: '8 Weeks',
                    timestamp: this.allowedDates[7],
                },
                {
                    label: '12 Weeks',
                    timestamp: this.allowedDates[11],
                },
            ];
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
        allowedDates() {
            return getThursdaysUntilTimestamp(this.veStore.now, this.veStore.now + NinetyDaysInMs);
        },
        minDate() {
            if (!this.allowedDates.length) return new Date();
            return new Date(this.allowedDates[0]);
        },
        maxDate() {
            return new Date(this.veStore.now + NinetyDaysInMs);
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
