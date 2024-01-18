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
                                :balance="Math.floor(veStore.balances.usdc)"
                                :value="amountUSDC"
                                @update="amountUSDC = $event"
                                :min="0"
                                :max="Math.floor(veStore.balances.usdc)"
                                class="mb-4"
                            >
                            </BaseFormGroupInputTokenAmount>
                            <BaseFormGroupInputTokenAmount
                                image="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                                symbol="THX"
                                :balance="Math.floor(veStore.balances.thx)"
                                :value="amountTHX"
                                @update="amountTHX = $event"
                                :min="0"
                                :max="Math.floor(veStore.balances.thx)"
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
                                Earn additional BPT next to Balancer's native $BAL rewards!
                            </b-alert>
                            <BaseFormGroupInputTokenAmount
                                symbol="20USDC-80THX"
                                :balance="Math.floor(veStore.balances.bpt)"
                                :value="amountDeposit"
                                @update="amountDeposit = $event"
                                :min="0"
                                :max="Math.floor(veStore.balances.bpt)"
                                class="mb-4"
                            />

                            <BaseFormGroupInputDate
                                label="Lock duration"
                                description="You will be able to withdraw early, but a penalty will be applied."
                                :enable-time-picker="false"
                                :min-date="startDate"
                                :start-date="startDate"
                                :value="lockEnd"
                                @update="lockEnd = $event"
                            />
                            <b-button class="w-100 mt-3" @click="onClickDeposit" variant="success"> Deposit </b-button>
                        </b-tab>
                        <b-tab>
                            <template #title>
                                <i class="fas fa-unlock me-1"></i>
                                Withdraw
                            </template>
                            <b-button class="w-100 mt-3" @click="onClickWithdraw" variant="primary">
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
import { fromWei } from 'web3-utils';

// import { BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';

// const config: BalancerSdkConfig = {
//     network: Network.POLYGON,
//     rpcUrl: 'https://polygon-rpc.com',
// };
// const balancer = new BalancerSDK(config);

function toFiat(amount: number | string) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
    return formatter.format(Number(amount));
}

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            isAlertDepositShown: true,
            startDate: new Date(),
            lockEnd: new Date(),
            balPrice: 0,
            publicUrl: 'https://thx.network',
            amountDeposit: 0,
            amountUSDC: 0,
            amountTHX: 0,
            fromWei,
            toFiat,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        ...mapStores(useVeStore),
    },
    watch: {
        'accountStore.isAuthenticated'() {
            this.veStore.getBPTBalance();
        },
    },
    methods: {
        onClickStart() {},
        onClickAddLiquidity() {},
        onClickDeposit() {
            this.veStore.deposit({
                amountInWei: String(this.amountDeposit), // Do wei conversion
                lockEndTimestamp: this.lockEnd.toISOString(), // Do ISO conversion
            });
        },
        onClickWithdraw() {},
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
