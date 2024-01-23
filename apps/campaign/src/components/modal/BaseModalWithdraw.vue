<template>
    <b-modal v-model="show" @hidden="$emit('hidden')" @show="onShow" centered hide-footer title="Lock 20USDC-80THX">
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Approve">
                <b-form-group label="Approve a deposit of" description="We cover the gas costs for this transaction.">
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
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { BPT_ADDRESS, VE_ADDRESS } from '../../config/secrets';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalDeposit',
    data() {
        return {
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
        isAlertInfoShown() {
            return !!this.error;
        },
        isApproved() {
            const allowance = this.walletStore.allowances[BPT_ADDRESS][VE_ADDRESS];
            if (allowance >= this.amountDeposit) return true;
            return false;
        },
    },
    watch: {
        tabIndex() {
            this.error = '';
        },
    },
    methods: {
        async onShow() {
            this.amountApproval = this.amount;
            this.amountDeposit = this.amount;
            await this.getApproval();
            if (this.isApproved) this.tabIndex = 1;
        },
        getApproval() {
            return this.walletStore.getApproval({
                tokenAddress: BPT_ADDRESS,
                spender: VE_ADDRESS,
                amountInWei: String(this.amountDeposit),
            });
        },
        waitForApproval() {
            const taskFn = async () => {
                this.getApproval();
                return this.isApproved ? Promise.resolve() : Promise.reject('Could not find token for ID');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickApprove() {
            this.isPolling = true;
            try {
                await this.walletStore.approve({
                    tokenAddress: BPT_ADDRESS,
                    spender: VE_ADDRESS,
                    amountInWei: String(this.amountDeposit), // Do wei conversion
                });
                // Wait for allowance to increase to the suffucient
                // amount for this deposit.
                await this.waitForApproval();

                // Next tab view
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
                await this.veStore.deposit({
                    amountInWei: String(this.amountDeposit), // Do wei conversion
                    lockEndTimestamp: Math.ceil(new Date(this.lockEnd).getTime() / 1000), // Do ISO conversion
                });
                this.$emit('hidden');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            console.log(response);
            this.error = response && response.error ? response.error.message : 'Something went wrong...';
        },
    },
});
</script>
