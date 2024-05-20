<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Stake 20USDC-80THX @ Balancer</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Approve">
                <BaseTabApprove
                    :amount="amountApproval"
                    :token="{ address: address.BPT, decimals: 18 }"
                    :spender="address.BPTGauge"
                    @update="amountApproval = $event"
                    @approve="onApprove"
                    @ok="tabIndex = 1"
                />
            </b-tab>
            <b-tab title="2. Stake">
                <b-form-group>
                    <b-form-input v-model="amountStake" type="number" />
                </b-form-group>
                <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickStake">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Stake</template>
                </b-button>
            </b-tab>
        </b-tabs>
        <p v-if="walletStore.wallet?.variant === WalletVariant.Safe" class="text-muted text-center mt-3 mb-0">
            ❤️ We sponsor the transaction costs of your <b-link href="" class="text-white">Safe Multisig</b-link>!
        </p>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ChainId } from '@thxnetwork/common/enums';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalStake',
    props: {
        show: Boolean,
        amount: { type: String, required: true },
    },
    data() {
        return {
            WalletVariant,
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            isModalStakeShown: false,
            amountStake: '0',
            amountApproval: '0',
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        isAlertInfoShown() {
            return !!this.error;
        },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
        tabIndex() {
            this.error = '';
        },
    },
    methods: {
        async onShow() {
            this.amountApproval = this.amount;
            this.amountStake = this.amount;
            this.walletStore.getApproval({ tokenAddress: this.address.BPT, spender: this.address.BPTGauge });
            this.getBalances();
        },
        getBalances() {
            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = formatUnits(this.walletStore.balances[this.address.BPT], 18);
            });
        },
        onApprove() {
            this.amountStake = this.amountApproval;
            this.tabIndex = 1;
        },
        async onClickStake() {
            this.isPolling = true;
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet!');

                const amountInWei = parseUnits(this.amountStake.toString(), 18);

                await this.liquidityStore.stake(wallet, { amountInWei: amountInWei.toString() });
                await this.liquidityStore.waitForStake(wallet, amountInWei);

                // Hide modal (or cast "success" and switch parent tab to withdrawal/rewards)
                this.$emit('staked');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : response.message;
        },
    },
});
</script>
