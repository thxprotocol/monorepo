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
                <b-card class="border-0 gradient-shadow-xl" style="min-height: 264px">
                    <b-tabs pills justified content-class="mt-3" nav-wrapper-class="text-white">
                        <b-tab title="Invest"> Balancer UI </b-tab>
                        <b-tab title="Lock" active>
                            <p>
                                Deposit liquidity on Balancer, and then stake your received BPT here to earn more BPT in
                                addition to Balancer's native $BAL rewards.
                            </p>
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
                            {{ lockEnd }}

                            <b-button class="w-100 mt-3" @click="onClickDeposit" variant="primary"> Deposit </b-button>
                        </b-tab>
                        <b-tab>
                            <template #title> Unlock </template>
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
            startDate: new Date(),
            lockEnd: new Date(),
            balPrice: 0,
            publicUrl: 'https://thx.network',
            amountDeposit: 0,
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
