<template>
    <b-container class="py-md-5">
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex order-1 order-md-0">
                <div>
                    <h1>Lock & Earn</h1>
                    <p class="lead mb-4">
                        Earn additional
                        <b-link
                            class="fw-bold text-white text-decoration-none"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/thx-network"
                        >
                            $THX
                        </b-link>
                        <sup class="text-success ms-1">
                            {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['THX'], 2))) }}
                        </sup>
                        and
                        <b-link
                            class="fw-bold text-white text-decoration-none"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/usdc"
                        >
                            $USDC
                        </b-link>
                        <sup class="text-success ms-1">
                            {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['USDC'], 2))) }}
                        </sup>
                        next to your native
                        <b-link
                            class="fw-bold text-white text-decoration-none"
                            target="_blank"
                            href="https://www.coingecko.com/en/coins/balancer"
                        >
                            $BAL
                        </b-link>
                        <sup class="text-success ms-1">
                            {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['BAL'], 2))) }}
                        </sup>
                        rewards for providing liquidity!
                    </p>
                    <p class="lead mb-4">
                        You will also receive <strong>$veTHX</strong> allowing you to partake in protocol governance 🚀
                    </p>
                    <b-button
                        variant="primary"
                        class="me-3 px-5"
                        :disabled="!accountStore.isAuthenticated"
                        @click="veStore.isModalClaimTokensShown = true"
                    >
                        Claim Rewards
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button
                        href="https://medium.com/thxprotocol/revolutionizing-gaming-with-thx-networks-new-vote-escrowed-tokenomics-18ef24239e46"
                        target="_blank"
                        variant="link"
                        class="text-white"
                    >
                        Learn more
                    </b-button>
                </div>
            </b-col>
            <b-col lg="5" class="py-4 py-lg-0 offset-lg-3 text-right">
                <b-card class="border-0 gradient-shadow-xl" style="min-height: 415px">
                    <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
                        <b-tab>
                            <template #title>
                                <i class="fas fa-balance-scale me-1" />
                                Liquidity
                            </template>
                            <hr />
                            <BaseTabLiquidity @change-tab="tabIndex = $event" />
                        </b-tab>
                        <b-tab>
                            <template #title>
                                <i class="fas fa-id-card me-1" />
                                Membership
                            </template>
                            <hr />
                            <BaseTabDeposit
                                v-if="veStore.lock && !Number(veStore.lock.amount)"
                                :amount="amountDepositInWei"
                                @update-amount="amountDepositInWei = $event"
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
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { roundUpFixed, toFiatPrice } from '@thxnetwork/campaign/utils/price';

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            toFiatPrice,
            roundUpFixed,
            tabIndex: 1,
            publicUrl: 'https://thx.network',
            amountDepositInWei: '0',
            isAlertSigninShown: true,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
                this.veStore.getLocks();
                this.liquidityStore.getSpotPrice();
                this.walletStore.getBalance(bptGaugeAddress).then(() => {
                    this.amountDepositInWei = this.walletStore.balances[bptGaugeAddress];
                });
            },
            immediate: true,
        },
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
