<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="modal-title">Lock 20USDC-80THX</strong>
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
            <b-tab title="2. Deposit">
                <b-form-group>
                    <b-form-input v-model="amountDeposit" type="number" :step="1 / 10 ** precision" />
                </b-form-group>
                <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickDeposit">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Deposit</template>
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
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { parseUnits } from 'ethers/lib/utils';
import { roundDownFixed } from '@thxnetwork/campaign/utils/price';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalDeposit',
    props: {
        show: Boolean,
        amount: { type: Number, required: true },
        lockEnd: { type: Date, required: true },
    },
    data() {
        return {
            WalletVariant,
            isShown: false,
            error: '',
            isPolling: false,
            tabIndex: 0,
            isModalDepositShown: false,
            precision: 6,
            amountApproval: '0',
            amountDeposit: '0',
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore),
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
            this.amountApproval = roundDownFixed(this.amount, this.precision);
            this.amountDeposit = roundDownFixed(this.amount, this.precision);
        },
        onApprove() {
            this.amountDeposit = this.amountApproval;
            this.tabIndex = 1;
        },
        async onClickDeposit() {
            this.isPolling = true;
            try {
                // Values to send
                const amountInWei = parseUnits(this.amountDeposit.toString(), 18);
                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);

                // Make deposit
                await this.veStore.deposit({ amountInWei: amountInWei.toString(), lockEndTimestamp });

                // Wait for amount and/or endDate to be updated if it changed
                await this.veStore.waitForLock(amountInWei, lockEndTimestamp);

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
