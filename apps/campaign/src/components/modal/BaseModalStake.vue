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
                <b-form-group label="Amount" :description="`Current allowance: ${currentAllowance}`">
                    <b-form-input v-model="amountApproval" type="number" />
                </b-form-group>
                <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickApprove">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Approve</template>
                </b-button>
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
        <p class="text-muted text-center mt-3 mb-0">
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
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalStake',
    props: {
        show: Boolean,
        amount: { type: Number, required: true },
    },
    data() {
        return {
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            isModalStakeShown: false,
            amountApproval: 0,
            amountStake: 0,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return;
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        allowance() {
            if (!this.address) return 0;
            if (!this.walletStore.allowances[this.address.BPT]) return 0;
            if (!this.walletStore.allowances[this.address.BPT][this.address.BPTGauge]) return 0;
            return this.walletStore.allowances[this.address.BPT][this.address.BPTGauge];
        },
        currentAllowance() {
            const allowance = BigNumber.from(this.allowance);
            return formatUnits(allowance, 'ether');
        },
        isAlertInfoShown() {
            return !!this.error;
        },
        isSufficientAllowance() {
            const allowanceInWei = BigNumber.from(this.allowance);
            const amountInWei = parseUnits(this.amountStake.toString(), 18);
            if (allowanceInWei.gte(amountInWei)) return true;
            return false;
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

            await this.getApproval();

            if (this.isSufficientAllowance) {
                this.tabIndex = 1;
            }
        },
        getApproval() {
            return this.walletStore.getApproval({
                tokenAddress: this.address.BPT,
                spender: this.address.BPTGauge,
            });
        },
        waitForApproval() {
            const taskFn = async () => {
                await this.getApproval();
                return this.isSufficientAllowance ? Promise.resolve() : Promise.reject('x');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickApprove() {
            this.isPolling = true;
            try {
                // Value to approve
                const amountInWei = parseUnits(this.amountStake.toString(), 18);

                await this.walletStore.approve({
                    tokenAddress: this.address.BPT,
                    spender: this.address.BPTGauge,
                    amountInWei: amountInWei.toString(),
                });

                // poll for allowance to increase
                await this.waitForApproval();

                // then change tab index to 1
                this.tabIndex = 1;
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        async onClickStake() {
            this.isPolling = true;
            try {
                // Values to send
                const amountInWei = parseUnits(this.amountStake.toString(), 18);

                // Make deposit
                await this.liquidityStore.stake({ amountInWei: amountInWei.toString() });

                // Wait for BPTGauge balance to increase
                await this.liquidityStore.waitForStake(amountInWei);

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
