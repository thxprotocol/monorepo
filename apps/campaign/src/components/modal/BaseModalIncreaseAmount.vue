<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Increase lock amount</strong>
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
                    :token-address="address.BPTGauge"
                    :spender="address.VotingEscrow"
                    @update="amountApproval = $event"
                    @approve="onApprove"
                    @ok="tabIndex = 1"
                />
            </b-tab>
            <b-tab title="2. Increase">
                <BaseFormGroupLockAmount :value="Number(lockAmount)" @update="lockAmount = $event" />
                <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickIncreaseAmount">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Increase Amount</template>
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
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { BigNumber } from 'ethers/lib/ethers';
import { contractNetworks } from '../../config/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ChainId } from '@thxnetwork/sdk';
import { roundDownFixed } from '@thxnetwork/campaign/utils/price';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalIncreaseAmount',
    props: {
        show: Boolean,
    },
    data() {
        return {
            WalletVariant,
            parseUnits,
            isShown: false,
            error: '',
            tabIndex: 0,
            precision: 6,
            isPolling: false,
            lockAmount: '0',
            amountApproval: '0',
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 'ether'));
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            this.amountApproval = roundDownFixed(this.balanceBPTGauge, this.precision);
            this.walletStore.getApproval({ tokenAddress: this.address.BPTGauge, spender: this.address.VotingEscrow });
        },
        onApprove() {
            this.lockAmount = this.amountApproval;
            this.tabIndex = 1;
        },
        async waitForIncrease() {
            const expectedAmount = BigNumber.from(this.veStore.lock.amount).add(parseUnits(this.lockAmount, 18));
            const taskFn = async () => {
                await this.veStore.getLocks();
                return BigNumber.from(this.veStore.lock.amount).eq(expectedAmount)
                    ? Promise.resolve()
                    : Promise.reject('Increase amount');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickIncreaseAmount() {
            this.isPolling = true;

            try {
                const amountInWei = parseUnits(String(this.lockAmount), 18);

                await this.veStore.increaseAmount({ amountInWei: amountInWei.toString() });
                await this.waitForIncrease();

                this.$emit('hidden');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : 'Something went wrong...';
        },
    },
});
</script>
