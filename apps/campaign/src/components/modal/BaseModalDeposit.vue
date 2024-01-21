<template>
    <b-modal v-model="show" @hidden="$emit('hidden')" @show="onShow" centered hide-footer title="Lock 20USDC-80THX">
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Approve">
                <b-form-group label="Approve a deposit of" description="We cover the gas costs for this transaction.">
                    <b-form-input type="number" v-model="amountApproval" />
                </b-form-group>
                <b-button variant="primary" @click="onClickApprove" class="w-100">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Approve</template>
                </b-button>
            </b-tab>
            <b-tab title="2. Deposit">
                <b-form-group>
                    <b-form-input type="number" v-model="amountDeposit" />
                </b-form-group>
                <b-button variant="primary" @click="onClickDeposit" class="w-100">
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

export default defineComponent({
    name: 'BaseModalDeposit',
    data() {
        return {
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
    },
    methods: {
        async onShow() {
            this.amountApproval = this.amount;
            this.amountDeposit = this.amount;
            await this.walletStore.getApproval({
                tokenAddress: BPT_ADDRESS,
                spender: VE_ADDRESS,
                amountInWei: String(this.amountDeposit),
            });
            const allowance = this.walletStore.allowances[BPT_ADDRESS][VE_ADDRESS];
            if (allowance >= this.amountDeposit) {
                this.tabIndex = 1;
            }
        },
        async onClickApprove() {
            this.isPolling = true;
            try {
                await this.walletStore.approve({
                    tokenAddress: BPT_ADDRESS,
                    spender: VE_ADDRESS,
                    amountInWei: String(this.amountDeposit), // Do wei conversion
                });
                // poll for allowance to increase
                // then change tab index to 1
                this.tabIndex = 1;
            } catch (error) {
                console.log(error);
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
                this.isModalDepositShown = false;
            } catch (error) {
                console.log(error);
            } finally {
                this.isPolling = false;
            }
        },
    },
});
</script>
