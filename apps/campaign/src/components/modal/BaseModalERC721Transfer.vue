<template>
    <b-modal :id="id" v-model="isShown" no-close-on-backdrop centered no-close-on-esc @hidden="$emit('hidden')">
        <template #header>
            <h5 class="modal-title"><i class="fas fa-exchange-alt me-2"></i> Transfer {{ token.nft.symbol }}</h5>
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

            <b-form-group label="Receiver" :state="isReceiverValid">
                <b-form-input v-model="receiver" :state="isReceiverValid" placeholder="0x0" />
            </b-form-group>

            <b-form-group v-if="token.nft.variant === NFTVariant.ERC1155" label="Amount" :state="isReceiverValid">
                <b-form-input v-model="erc1155Amount" :state="isReceiverValid" placeholder="0x0" />
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
import { isAddress } from 'web3-utils';
import { NFTVariant } from '../../types/enums/nft';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { WalletVariant } from '../../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalERC721Transfer',
    props: {
        id: String,
        token: { type: Object as PropType<TERC721Token>, required: true },
        error: String,
        show: Boolean,
        isLoading: Boolean,
    },
    data() {
        return { NFTVariant, isShown: false, amount: 0, erc1155Amount: 0, receiver: '' };
    },
    computed: {
        ...mapStores(useWalletStore),
        isSubmitDisabled: function () {
            return this.isLoading || !this.isReceiverValid || this.isDisabledTransfer;
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
            const payload = {
                ...(this.token.nft.variant === NFTVariant.ERC721 && {
                    erc721Id: this.token.nft._id,
                    erc721TokenId: this.token._id,
                }),
                ...(this.token.nft.variant === NFTVariant.ERC1155 && {
                    erc1155Id: this.token.nft._id,
                    erc1155TokenId: this.token._id,
                    erc1155Amount: this.erc1155Amount,
                }),
                to: this.receiver,
            };
            this.$emit('submit', payload);
        },
    },
});
</script>
