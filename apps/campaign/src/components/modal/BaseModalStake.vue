<template>
    <b-modal
        v-model="isShown"
        @hidden="$emit('hidden')"
        @show="onShow"
        centered
        hide-footer
        title="Stake 20USDC-80THX @ Balancer"
    >
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Approve">
                <b-form-group label="Amount" :description="`Current allowance: ${fromWei(allowance.toString())}`">
                    <b-form-input type="number" v-model="amountApproval" />
                </b-form-group>
                <b-button variant="primary" @click="onClickApprove" class="w-100" :disabled="isPolling">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Approve</template>
                </b-button>
            </b-tab>
            <b-tab title="2. Deposit">
                <b-form-group>
                    <b-form-input type="number" v-model="amountStake" />
                </b-form-group>
                <b-button variant="primary" @click="onClickStake" class="w-100" :disabled="isPolling">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Deposit</template>
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
import { fromWei, toWei } from 'web3-utils';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalStake',
    data() {
        return {
            fromWei,
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            isModalStakeShown: false,
            amountApproval: 0,
            amountStake: 0,
        };
    },
    props: {
        show: Boolean,
        amount: { type: Number, required: true },
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        allowance() {
            if (!this.walletStore.allowances[this.bptAddress]) return 0;
            if (!this.walletStore.allowances[this.bptAddress][this.bptGaugeAddress]) return 0;
            return this.walletStore.allowances[this.bptAddress][this.bptGaugeAddress];
        },
        isAlertInfoShown() {
            return !!this.error;
        },
        isSufficientAllowance() {
            if (this.allowance >= this.amountStake) return true;
            return false;
        },
        bptAddress() {
            if (!this.walletStore.wallet) return;
            return contractNetworks[this.walletStore.wallet.chainId].BPT;
        },
        bptGaugeAddress() {
            if (!this.walletStore.wallet) return;
            return contractNetworks[this.walletStore.wallet.chainId].BPTGauge;
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
                tokenAddress: this.bptAddress,
                spender: this.bptGaugeAddress,
                amountInWei: toWei(String(this.amountApproval)),
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
                await this.walletStore.approve({
                    tokenAddress: this.bptAddress,
                    spender: this.bptGaugeAddress,
                    amountInWei: toWei(String(this.amountApproval)),
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
                const amountInWei = toWei(String(this.amountStake));

                // Make deposit
                await this.liquidityStore.stake({ amountInWei });

                // Wait for BPTGauge balance to increase
                // await this.liquidityStore.waitForStake(totalAmount);

                this.walletStore.getBalance(this.bptAddress);
                this.walletStore.getBalance(this.bptGaugeAddress);

                // Hide modal (or cast "success" and switch parent tab to withdrawal/rewards)
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
