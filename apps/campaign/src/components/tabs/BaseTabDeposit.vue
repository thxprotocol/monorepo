<template>
    <b-alert variant="primary" v-model="isModalUnstakedLiquidityShown" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        You have unstaked liquidity!
        <b-link @click="$emit('change-tab', 0)">Stake my liquidity</b-link>
    </b-alert>
    <b-alert variant="primary" v-model="isModalInsufficientAmountShown" class="p-2">
        <i class="fas fa-exclamation-circle me-1" />
        We require a minimal amount worth $3.00 USDC to be locked.
    </b-alert>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['20USDC-80THX']"
        :balance="walletStore.balances[address.BPTGauge]"
        :value="amount"
        @update="$emit('update-amount', $event)"
        :min="minBPTGValue / liquidityStore.pricing['20USDC-80THX']"
        :max="walletStore.balances[address.BPTGauge]"
        class="mb-4"
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
                    @click="lockEnd = new Date(timestamp)"
                    size="sm"
                    variant="primary"
                    class="rounded-pill me-2 mt-2 mb-0"
                    :disabled="lockEnd.getTime() === timestamp"
                >
                    {{ label }}
                </b-button>
            </div>
        </template>
    </BaseFormGroupInputDate>

    <b-button
        :disabled="isInsufficientAmount"
        @click="isModalDepositShown = true"
        class="w-100 mt-3"
        :variant="!amount ? 'primary' : 'success'"
    >
        Deposit
    </b-button>
    <BaseModalDeposit
        :amount="amount"
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
import { MaxDuration, NinetyDaysInMs, getThursdaysUntilTimestamp } from '../../utils/date';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseTabDeposit',
    data() {
        return {
            isModalDepositShown: false,
            isAlertDepositShown: true,
            isModalWithdrawShown: false,
            maxDuration: MaxDuration,
            maxDate: new Date(MaxDuration),
            lockEnd: new Date(),
            minBPTGValue: 3,
        };
    },
    props: {
        amount: { type: Number, required: true },
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
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
            return this.walletStore.balances[this.bptAddress] > 0;
        },
        isModalInsufficientAmountShown() {
            return (
                this.amountDeposit * this.liquidityStore.pricing['20USDC-80THX'] < this.minBPTGValue &&
                this.amountDeposit * this.liquidityStore.pricing['20USDC-80THX'] > 0
            );
        },
        isInsufficientAmount() {
            return this.amountDeposit * this.liquidityStore.pricing['20USDC-80THX'] < this.minBPTGValue;
        },
        allowedDates() {
            return getThursdaysUntilTimestamp(Date.now() + NinetyDaysInMs);
        },
        minDate() {
            if (!this.allowedDates.length) return new Date();
            return new Date(this.allowedDates[0]);
        },
    },
});
</script>
