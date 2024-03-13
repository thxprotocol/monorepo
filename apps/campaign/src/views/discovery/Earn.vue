<template>
    <b-container>
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex order-1 order-md-0">
                <div>
                    <h1>Lock & Earn</h1>
                    <p class="lead mb-4">
                        Earn additional BPT next to your native $BAL rewards! You will also receive VeTHX allowing you
                        to partake in protocol governance.
                    </p>
                    <b-button @click="tabIndex = 1" variant="primary" class="me-3 px-5">
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
                    <b-tabs pills justified content-class="mt-3" nav-wrapper-class="text-white" v-model="tabIndex">
                        <b-tab>
                            <template #title>
                                <i class="fas fa-balance-scale me-1"></i>
                                Liquidity
                            </template>
                            <BaseTabLiquidity @change-tab="tabIndex = $event" />
                        </b-tab>
                        <b-tab>
                            <template #title>
                                <i class="fas fa-id-card me-1"></i>
                                Membership
                            </template>
                            <BaseTabDeposit
                                v-if="!veStore.lock.amount"
                                :amount="amountDeposit"
                                @update-amount="amountDeposit = $event"
                                @change-tab="tabIndex = $event"
                            />
                            <BaseTabWithdraw v-else @change-tab="tabIndex = $event" />
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
import { useVeStore } from '../../stores/VE';
import { format, differenceInDays } from 'date-fns';
import { fromWei } from 'web3-utils';
import { contractNetworks } from '@thxnetwork/campaign/config/constants';

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            fromWei,
            format,
            tabIndex: 1,
            publicUrl: 'https://thx.network',
            amountDeposit: 0,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
    },
    watch: {
        'walletStore.wallet'(wallet) {
            if (!wallet) return;
            const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
            this.veStore.getLocks();
            this.liquidityStore.getSpotPrice();
            this.walletStore.getBalance(bptGaugeAddress).then(() => {
                this.amountDeposit = this.walletStore.balances[bptGaugeAddress];
            });
        },
    },
    methods: {
        onClickStart() {},
    },
});
</script>
<style>
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
