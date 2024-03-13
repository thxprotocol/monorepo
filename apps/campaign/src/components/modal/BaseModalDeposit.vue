<template>
    <b-modal v-model="isShown" @hidden="$emit('hidden')" @show="onShow" centered hide-footer title="Lock 20USDC-80THX">
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
                    <b-form-input type="number" v-model="amountDeposit" />
                </b-form-group>
                <b-button variant="primary" @click="onClickDeposit" class="w-100" :disabled="isPolling">
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
import { contractNetworks } from '../../config/constants';
import { toWei, fromWei } from 'web3-utils';
import poll from 'promise-poller';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseModalDeposit',
    data() {
        return {
            fromWei,
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            isModalDepositShown: false,
            amountApproval: 0,
            amountDeposit: 0,
        };
    },
    props: {
        show: Boolean,
        amount: { type: Number, required: true },
        lockEnd: { type: Date, required: true },
    },
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useVeStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        allowance() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return 0;
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return 0;

            return this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow];
        },
        isAlertInfoShown() {
            return !!this.error;
        },
        isSufficientAllowance() {
            if (this.allowance >= this.amountDeposit) return true;
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
            this.amountDeposit = this.amount;
            await this.getApproval();
            if (this.isSufficientAllowance) {
                this.tabIndex = 1;
            }
        },
        getApproval() {
            return this.walletStore.getApproval({
                tokenAddress: this.address.BPTGauge,
                spender: this.address.VotingEscrow,
                amountInWei: toWei(String(this.amountDeposit)),
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
                    tokenAddress: this.address.BPTGauge,
                    spender: this.address.VotingEscrow,
                    amountInWei: toWei(String(this.amountDeposit)),
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
        async onClickDeposit() {
            this.isPolling = true;
            try {
                // Values to send
                const amountInWei = toWei(String(this.amountDeposit));
                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);

                // Values to check
                const lock = this.veStore.lock;
                const totalAmount = lock ? lock.amount + this.amountDeposit : this.amountDeposit;
                const latestLockEndTimestamp = lock
                    ? lock.end < lockEndTimestamp
                        ? lockEndTimestamp
                        : lock.end
                    : lockEndTimestamp;

                // Make deposit
                await this.veStore.deposit({ amountInWei, lockEndTimestamp });

                // Wait for amount and/or endDate to be updated if it changed
                await this.veStore.waitForLock(totalAmount, latestLockEndTimestamp);

                this.walletStore.getBalance(this.address.BPTGauge);
                this.walletStore.getBalance(this.address.VotingEscrow);

                this.$emit('hidden');
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
