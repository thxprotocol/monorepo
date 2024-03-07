<template>
    <b-container>
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>Lock & Earn</h1>
                    <p class="lead mb-4">
                        Earn additional BPT next to your native $BAL rewards! You will also receive VeTHX allowing you
                        to partake in protocol governance.
                    </p>
                    <b-button @click="onClickStart" variant="primary" class="me-3 px-5">
                        Claim
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button :href="publicUrl" target="_blank" variant="link" class="text-white">
                        Learn more
                    </b-button>
                </div>
            </b-col>
            <b-col lg="5" class="py-4 py-lg-0 offset-lg-3 text-right">
                <b-card class="border-0 gradient-shadow-xl" style="min-height: 415px">
                    <b-tabs pills justified content-class="mt-3" nav-wrapper-class="text-white">
                        <b-tab active>
                            <template #title>
                                <i class="fas fa-balance-scale me-1"></i>
                                Liquidity
                            </template>

                            <BaseFormGroupInputTokenAmount
                                @update="amountStake = $event"
                                :usd="liquidityStore.pricing['20USDC-80THX']"
                                :balance="Math.floor(walletStore.balances[bptAddress])"
                                :value="amountStake"
                                :min="0"
                                :max="Math.floor(walletStore.balances[bptAddress])"
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
                            <b-button
                                :disabled="!amountStake"
                                class="w-100 mt-3"
                                @click="isModalStakeShown = true"
                                :variant="!amountStake ? 'primary' : 'success'"
                            >
                                Stake Liquidity
                            </b-button>
                            <BaseModalStake
                                :show="isModalStakeShown"
                                :amount="amountStake"
                                @hidden="isModalStakeShown = false"
                            />
                            <!-- <hr />

                            <BaseFormGroupInputTokenAmount
                                @update="amountUSDC = $event"
                                :usd="liquidityStore.pricing['USDC']"
                                :balance="Math.floor(walletStore.balances[usdcAddress])"
                                :value="amountUSDC"
                                :min="0"
                                :max="Math.floor(walletStore.balances[usdcAddress])"
                                class="mb-4"
                            >
                                <template #label>
                                    <div class="d-flex align-items-center" style="width: 65px">
                                        <b-img
                                            src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                                            alt="USDC icon"
                                            width="20"
                                            height="20"
                                            class="me-2"
                                        />
                                        USDC
                                    </div>
                                </template>
                            </BaseFormGroupInputTokenAmount>
                            <BaseFormGroupInputTokenAmount
                                @update="amountTHX = $event"
                                :usd="liquidityStore.pricing['THX']"
                                :balance="Math.floor(walletStore.balances[thxAddress])"
                                :value="amountTHX"
                                :min="0"
                                :max="Math.floor(walletStore.balances[thxAddress])"
                                class="mb-4"
                            >
                                <template #label>
                                    <div class="d-flex align-items-center" style="width: 65px">
                                        <b-img
                                            src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                                            alt="THX icon"
                                            width="20"
                                            height="20"
                                            class="me-2"
                                        />
                                        THX
                                    </div>
                                </template>
                            </BaseFormGroupInputTokenAmount>
                            <b-button disabled class="w-100 mt-3" variant="primary"> Create Liquidity </b-button> -->
                        </b-tab>
                        <b-tab>
                            <template #title>
                                <i class="fas fa-lock me-1"></i>
                                Lock
                            </template>
                            <BaseFormGroupInputTokenAmount
                                symbol="20USDC-80THX-gauge"
                                :usd="liquidityStore.pricing['20USDC-80THX']"
                                :balance="Math.floor(walletStore.balances[bptGaugeAddress])"
                                :value="amountDeposit"
                                @update="amountDeposit = $event"
                                :min="minBPTGValue / liquidityStore.pricing['20USDC-80THX']"
                                :max="Math.floor(walletStore.balances[bptGaugeAddress])"
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
                                :disabled="isDisabledDeposit"
                                @click="isModalDepositShown = true"
                                class="w-100 mt-3"
                                variant="success"
                            >
                                Deposit
                            </b-button>
                            <BaseModalDeposit
                                :amount="amountDeposit"
                                :show="isModalDepositShown"
                                :lock-end="lockEnd"
                                @hidden="isModalDepositShown = false"
                            />
                        </b-tab>
                        <b-tab v-if="veStore.lock">
                            <template #title>
                                <i class="fas fa-unlock me-1"></i>
                                Withdraw
                            </template>
                            <b-alert v-model="isEarly" class="py-2 px-3" variant="danger">
                                <i class="fas fa-info-circle me-1"></i>
                                A penalty will be applied on early withdrawals!
                            </b-alert>
                            <!-- 
                            {{ new Date(veStore.lock.now) }}
                            <pre>
                                {{ veStore.lock }}
                            </pre> -->

                            <b-row>
                                <b-col>
                                    <b-form-group label="Amount">
                                        <strong class="h3">{{ veStore.lock.amount }}</strong>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group label="Lock End">
                                        <strong class="h3">
                                            {{ differenceInDays(veStore.lock.end, veStore.lock.now) }} days
                                        </strong>
                                        <i
                                            v-b-tooltip
                                            :title="`${format(new Date(veStore.lock.end), 'MMMM do yyyy hh:mm:ss')}`"
                                            class="fas fa-info-circle me-1 cursor-pointer text-opaque"
                                        />
                                    </b-form-group>
                                </b-col>
                            </b-row>
                            <b-button class="w-100 mt-3" @click="isModalWithdrawShown = true" variant="primary">
                                Withdraw
                            </b-button>
                            <BaseModalWithdraw
                                :show="isModalWithdrawShown"
                                :is-early="isEarly"
                                @hidden="isModalWithdrawShown = false"
                            />
                        </b-tab>
                    </b-tabs>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { getChainId, useVeStore } from '../../stores/VE';
import { format, differenceInDays } from 'date-fns';
import { contractNetworks } from '../../config/constants';

const { USDC, THX, BPT, BPTGauge } = contractNetworks[getChainId()];
const OneDayInMs = 60 * 60 * 24 * 1000;
const NinetyDaysInMs = OneDayInMs * 90;
const MaxDuration = Date.now() + NinetyDaysInMs;

function getThursdaysUntilTimestamp(futureTimestamp: number) {
    const thursdays = [];

    // Get the current timestamp
    const timestampTomorrow = Date.now() + OneDayInMs;

    // Start from the current date and iterate until the future timestamp
    for (let timestamp = timestampTomorrow; timestamp <= futureTimestamp; timestamp += OneDayInMs) {
        const currentDate = new Date(timestamp);

        // Check if the current day is Thursday (day index 4 in JavaScript, where Sunday is 0 and Saturday is 6)
        if (currentDate.getDay() === 4) {
            thursdays.push(timestamp);
        }
    }

    return thursdays;
}

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            format,
            differenceInDays,
            usdcAddress: USDC,
            thxAddress: THX,
            bptAddress: BPT,
            bptGaugeAddress: BPTGauge,
            publicUrl: 'https://thx.network',
            isModalStakeShown: false,
            isModalDepositShown: false,
            isAlertDepositShown: true,
            isModalWithdrawShown: false,
            maxDuration: MaxDuration,
            maxDate: new Date(MaxDuration),
            lockEnd: new Date(),
            minBPTGValue: 3,
            balPrice: 0,
            amountStake: 0,
            amountDeposit: 0,
            amountUSDC: 0,
            amountTHX: 0,
            isEarlyAttempt: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
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
        isEarly() {
            if (!this.veStore.lock) return;
            const { now, end } = this.veStore.lock;
            return Number(now) < Number(end);
        },
        isDisabledDeposit() {
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
    watch: {
        'accountStore.isAuthenticated'() {
            this.walletStore.getBalance(this.bptAddress).then(() => {
                this.amountStake = this.walletStore.balances[this.bptAddress];
            });
            this.walletStore.getBalance(this.bptGaugeAddress).then(() => {
                this.amountDeposit = this.walletStore.balances[this.bptGaugeAddress];
            });
            this.veStore.getLocks().then(() => {
                // Update minDate if there is a lock already
                if (this.veStore.lock?.end) {
                    this.minDate = new Date(this.veStore.lock.end);
                }
            });
            this.liquidityStore.getSpotPrice();
        },
    },
    methods: {
        onClickStart() {},
    },
});
</script>
<style scoped>
.form-control,
.form-control:focus {
    border-color: var(--bs-primary);
}
.progress {
    background-color: var(--bs-primary);
}
</style>
<style>
.nav-pills .nav-link:not(.active) {
    color: white;
    opacity: 0.75;
}
.placeholder {
    border-radius: 3px !important;
}
</style>
