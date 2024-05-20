<template>
    <b-modal :id="id" v-model="isShown" no-close-on-backdrop centered no-close-on-esc @hidden="$emit('hidden')">
        <template #header>
            <h5 class="modal-title"><i class="fas fa-exchange-alt me-2"></i> Transfer {{ token.erc20.symbol }}</h5>
            <b-link class="btn-close" @click="isShown = false"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-model="isDisabledTransfer" variant="primary" class="p-2">
                <i class="fas fa-exclamation-circle me-1"></i>
                Transfer this token using another wallet like Metamask.
            </b-alert>

            <b-alert v-model="isAlertErrorShown" variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>

            <b-form-group label="Amount" :state="isAmountValid">
                <b-input-group>
                    <b-form-input v-model="amount" type="number" :state="isAmountValid" />
                    <b-input-group-append>
                        <b-button
                            style="border-radius: 0px 5px 5px 0px"
                            variant="primary"
                            @click="amount = token.walletBalance"
                        >
                            Max
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form-group>
            <b-form-group label="Receiver" :state="isReceiverValid">
                <b-form-input v-model="receiver" :state="isReceiverValid" placeholder="0x0" />
            </b-form-group>
        </template>
        <template #footer>
            <b-button variant="primary" class="w-100 rounded-pill" :disabled="isSubmitDisabled" @click="onClickSubmit">
                Transfer
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { isAddress, toWei } from 'web3-utils';
import { mapStores } from 'pinia';
import { WalletVariant } from '../../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalERC20Transfer',
    props: {
        id: {
            type: String,
            required: true,
        },
        token: {
            type: Object as PropType<TERC20Token>,
            required: true,
        },
        error: String,
        show: Boolean,
        isLoading: Boolean,
    },
    data() {
        return { isShown: false, amount: 0, receiver: '' };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        isAmountValid: function () {
            return !this.amount
                ? undefined
                : Number(this.amount) > 0 && Number(this.amount) <= this.token.walletBalance;
        },
        isSubmitDisabled: function () {
            return this.isLoading || !this.isReceiverValid || !this.isAmountValid || this.isDisabledTransfer;
        },
        isReceiverValid: function () {
            return this.receiver ? isAddress(this.receiver) : undefined;
        },
        isAlertErrorShown() {
            return !!this.error;
        },
        isDisabledTransfer() {
            if (!this.walletStore.wallet) return true;
            return this.walletStore.wallet.variant !== WalletVariant.Safe;
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickSubmit() {
            const config: TERC20TransferConfig = {
                erc20Id: this.token.erc20._id,
                to: this.receiver,
                amount: toWei(String(this.amount), 'ether'),
                chainId: this.accountStore.config.chainId,
            };
            this.$emit('submit', config);
        },
    },
});
</script>
