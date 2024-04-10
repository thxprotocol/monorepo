<template>
    <BaseCardHeader>
        <template #primary>
            <h1>Join THX Network</h1>
            <p class="lead mb-4">
                Earn weekly rewards and gain access to more exclusive quests and rewards in your favourite games 🎁
            </p>
            <b-button
                variant="success"
                class="me-3 px-5"
                href="https://docs.thx.network/faq/memberships"
                target="_blank"
            >
                Become a member
            </b-button>
            <!-- <b-button href="https://docs.thx.network/faq/memberships" target="_blank" variant="link" class="text-white">
                Learn more
            </b-button> -->
        </template>
        <template #secondary>
            <b-card class="border-0 gradient-shadow-xl" style="min-height: 375px">
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
        </template>
    </BaseCardHeader>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '@thxnetwork/campaign/config/constants';

export default defineComponent({
    name: 'BaseCardHeaderHome',
    data(): any {
        return {
            tabIndex: 1,
            amountDepositInWei: '0',
            isAlertSigninShown: true,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore),
    },

    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
                this.veStore.getLocks();
                this.walletStore.getBalance(bptGaugeAddress).then(() => {
                    this.amountDepositInWei = this.walletStore.balances[bptGaugeAddress];
                });
            },
            immediate: true,
        },
    },
    async mounted() {
        //
    },
});
</script>
