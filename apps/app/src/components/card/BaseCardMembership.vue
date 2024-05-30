<template>
    <b-card class="gradient-shadow-xl" no-body>
        <b-tabs v-model="index" pills card justified active-nav-item-class="text-success" nav-class="pb-2" lazy>
            <b-tab active>
                <template #title>
                    <span class="text-opaque me-1">1.</span> Add
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle ms-2 text-opaque"
                        title="Provide liquidity by turning your THX or USDC.e in 20USDC-80THX using Balancer Liquidity Pools."
                    />
                </template>
                <BaseTabLiquidityCreate @change-tab="index = $event" />
            </b-tab>
            <b-tab>
                <template #title>
                    <span class="text-opaque me-1">2.</span> Stake
                    <i
                        v-if="isTooltipUnstakedLiquidityShown"
                        v-b-tooltip
                        class="fas fa-info-circle ms-2 text-danger"
                        title="You have unstaked 20USDC-80THX! You can only lock staked 20USDC-80THX."
                    />
                    <i
                        v-else
                        v-b-tooltip
                        class="fas fa-question-circle ms-2 text-opaque"
                        title="Stake your provided liquidity in the Balancer Gauge in order to receive $BAL emissions."
                    />
                </template>
                <BaseTabLiquidityStake @change-tab="index = $event" />
            </b-tab>
            <b-tab>
                <template #title>
                    <span class="text-opaque me-1">3.</span> Lock
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle ms-2 text-opaque"
                        title="Lock your staked liquidity to receive veTHX, earn your share of the rewards and gain additonal membership benefits."
                    />
                </template>
                <BaseTabLiquidityLock v-if="isLocker" @change-tab="index = $event" />
                <BaseTabWithdraw v-else @change-tab="index = $event" />
            </b-tab>
        </b-tabs>

        <b-button
            v-if="index != 2 || (index == 2 && isLocker)"
            class="d-flex text-decoration-none align-items-center text-white p-0 m-0 mx-3 text-start"
            variant="link"
            @click="veStore.isAccepted = !veStore.isAccepted"
        >
            <i class="fas me-2 mt-1" :class="veStore.isAccepted ? 'fa-check-square' : 'fa-square'" />
            <div>
                I agree to the
                <b-link class="text-accent" @click.stop="openURL('https://thx.network/terms-of-use-app.pdf')">
                    Terms
                </b-link>
                and
                <b-link class="text-accent" @click.stop="openURL('https://thx.network/privacy-policy.pdf')">
                    Privacy Policy
                </b-link>
            </div>
        </b-button>
        <hr class="mb-0" />
        <b-button
            variant="link"
            href="https://docs.thx.network/faq/memberships"
            target="_blank"
            class="w-100 text-opaque text-white mt-1 my-2"
        >
            Learn more about memberships
            <i class="fas fa-external-link-alt ms-1 small" />
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/common/enums';
import { formatUnits } from 'ethers/lib/utils';

export default defineComponent({
    name: 'BaseCardMembership',
    props: {
        tabIndex: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            index: 0,
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore),
        isLocker() {
            return this.veStore.lock && !Number(this.veStore.lock.amount);
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceUSDC() {
            if (!this.walletStore.balances[this.address.USDC]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.USDC], 6));
        },
        balanceTHX() {
            if (!this.walletStore.balances[this.address.THX]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.THX], 18));
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPT], 18));
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 18));
        },
        isTooltipUnstakedLiquidityShown() {
            return this.balanceBPT && !this.balanceBPTGauge;
        },
    },
    watch: {
        'tabIndex': {
            handler(value: number) {
                this.index = value;
            },
            immediate: true,
        },
        'walletStore.wallet': {
            async handler(wallet, prevWallet) {
                // Only update balances if a new wallet has been set
                if (!wallet || (prevWallet && wallet._id === prevWallet._id)) return;
                await this.getBalances();

                // If there is BPTGauge then lock liquidity
                if (this.balanceBPTGauge) this.index = 2;
                // If not and there is BPT then stake liquidity
                else if (this.balanceBPT) this.index = 1;
                // If not then set the default or preferred index
                else this.index = this.tabIndex;
            },
            immediate: true,
        },
    },
    methods: {
        openURL(url: string) {
            window.open(url, '_blank');
        },
        async getBalances() {
            await Promise.all([
                this.walletStore.getBalance(this.address.USDC),
                this.walletStore.getBalance(this.address.THX),
                this.walletStore.getBalance(this.address.BPT),
                this.walletStore.getBalance(this.address.BPTGauge),
            ]);
        },
    },
});
</script>

<style lang="scss">
.tabs .card-header {
    .nav-link:not(.active):hover,
    .nav-link:not(.active):focus {
        color: white !important;
    }
}
</style>
