<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>Lock & Earn</h1>
                    <p class="lead mb-4">Earn additional rewards by locking your 80THX-20USD in VeTHX.</p>
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
                        <b-tab title="Invest">
                            <template #title>
                                <i class="fas fa-dollar-sign me-1"></i>
                                Liquidity
                            </template>
                            <BaseFormGroupInputTokenAmount
                                image="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                                symbol="USDC"
                                :balance="Math.floor(walletStore.balances[usdcAddress])"
                                :value="amountUSDC"
                                @update="amountUSDC = $event"
                                :min="0"
                                :max="Math.floor(walletStore.balances[usdcAddress])"
                                class="mb-4"
                            >
                            </BaseFormGroupInputTokenAmount>
                            <BaseFormGroupInputTokenAmount
                                image="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                                symbol="THX"
                                :balance="Math.floor(walletStore.balances[thxAddress])"
                                :value="amountTHX"
                                @update="amountTHX = $event"
                                :min="0"
                                :max="Math.floor(walletStore.balances[thxAddress])"
                                class="mb-4"
                            />
                            <b-button class="w-100 mt-3" @click="onClickAddLiquidity" variant="success">
                                Add Liquidity
                            </b-button>
                        </b-tab>
                        <b-tab active>
                            <template #title>
                                <i class="fas fa-lock me-1"></i>
                                Deposit
                            </template>
                            <b-alert v-model="isAlertDepositShown" class="py-2 px-3">
                                <i class="fas fa-info-circle me-1"></i>
                                Earn additional BPT next to the native $BAL rewards you receive when
                                <b-link
                                    href="https://app.balancer.fi/#/polygon/pool/0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe"
                                    target="_blank"
                                >
                                    providing liquidity on Balancer
                                </b-link>
                                !
                            </b-alert>
                            <BaseFormGroupInputTokenAmount
                                symbol="20USDC-80THX"
                                :balance="Math.floor(walletStore.balances[bptAddress])"
                                :value="amountDeposit"
                                @update="amountDeposit = $event"
                                :min="0"
                                :max="Math.floor(walletStore.balances[bptAddress])"
                                class="mb-4"
                            />

                            <BaseFormGroupInputDate
                                label="Lock duration"
                                description="You will be able to withdraw early, but a penalty will be applied!"
                                :enable-time-picker="false"
                                :min-date="startDate"
                                :start-date="startDate"
                                :value="lockEnd"
                                @update="lockEnd = $event"
                            />
                            <b-button @click="isModalDepositShown = true" class="w-100 mt-3" variant="success">
                                Deposit
                            </b-button>
                            <BaseModalDeposit
                                :amount="amountDeposit"
                                :show="isModalDepositShown"
                                :lock-end="lockEnd"
                                @hidden="isModalDepositShown = false"
                            />
                        </b-tab>
                        <b-tab>
                            <template #title>
                                <i class="fas fa-unlock me-1"></i>
                                Withdraw
                            </template>
                            <b-alert v-model="isAlertWithdrawShown" class="p-2" variant="danger">
                                <i class="fas fa-info-circle me-1"></i>
                                A penalty will be applied on early withdrawals!
                            </b-alert>
                            <b-row v-if="veStore.lock">
                                <b-col>
                                    <b-form-group label="Amount">
                                        <strong>{{ veStore.lock.amount }}</strong>
                                    </b-form-group>
                                </b-col>
                                <b-col>
                                    <b-form-group label="Lock End">
                                        <strong>
                                            7 days
                                            <i
                                                v-b-tooltip
                                                :title="`${format(
                                                    new Date(Number(veStore.lock.end)),
                                                    'MMMM do yyyy hh:mm:ss',
                                                )}`"
                                                class="fas fa-info-circle me-1 cursor-pointer text-opaque"
                                            />
                                        </strong>
                                    </b-form-group>
                                </b-col>
                                <b-form-group v-if="isAlertWithdrawShown" label="Withdraw Penalty">
                                    <b-form-checkbox v-model="isEarlyAttempt">
                                        I accept a penalty of ...
                                    </b-form-checkbox>
                                </b-form-group>
                            </b-row>
                            <b-button class="w-100 mt-3" @click="isModalWithdrawShown = true" variant="primary">
                                Withdraw
                            </b-button>
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
import { useVeStore } from '../../stores/VE';
import { BPT_ADDRESS } from '../../config/secrets';
import { THX_POLYGON_ADDRESS, USDC_POLYGON_ADDRESS } from '../../config/constants';
import { format } from 'date-fns';

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            format,
            usdcAddress: USDC_POLYGON_ADDRESS,
            thxAddress: THX_POLYGON_ADDRESS,
            bptAddress: BPT_ADDRESS,
            publicUrl: 'https://thx.network',
            isModalDepositShown: false,
            isAlertDepositShown: true,
            isModalWithdrawShown: false,
            startDate: new Date(),
            lockEnd: new Date(),
            balPrice: 0,
            amountDeposit: 0,
            amountUSDC: 0,
            amountTHX: 0,
            isEarlyAttempt: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        ...mapStores(useVeStore),
        isAlertWithdrawShown() {
            if (!this.veStore.lock) return;
            const { now, end } = this.veStore.lock;
            return Number(now) > Number(end);
        },
    },
    watch: {
        'accountStore.isAuthenticated'() {
            this.walletStore.getBalance(BPT_ADDRESS);
            this.veStore.getLocks();
        },
    },
    methods: {
        onClickStart() {},
        onClickAddLiquidity() {},
        onClickWithdraw() {
            // Should only be true is the isEarlyAttempt is intentional
            // use a checkbox for this
            this.veStore.withdraw(this.isEarlyAttempt);
        },
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
.placeholder {
    border-radius: 3px !important;
}
</style>
