<template>
    <b-modal :id="id" v-model="isShown" @hidden="$emit('hidden')" no-close-on-backdrop centered no-close-on-esc>
        <template #header>
            <h5 class="modal-title"><i class="fas fa-exchange-alt me-2"></i> Transfer {{ token.nft.symbol }}</h5>
            <b-link class="btn-close" @click="isShown = false"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-model="isVariantMetamask" variant="warning" class="py-1 px-2">
                <i class="fas fa-exclamation-circle me-1"></i>
                Please use Metamask to transfer this token.
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
import { useAccountStore } from '../../stores/Account';
import { isAddress } from 'web3-utils';
import { AccountVariant } from '../../types/enums/accountVariant';
import { NFTVariant } from '../../types/enums/nft';

export default defineComponent({
    name: 'BaseModalERC721Transfer',
    data() {
        return { NFTVariant, isShown: false, amount: 0, erc1155Amount: 0, receiver: '' };
    },
    computed: {
        isSubmitDisabled: function () {
            return this.isLoading || !this.isReceiverValid || this.isVariantMetamask;
        },
        isReceiverValid: function () {
            return this.receiver ? isAddress(this.receiver) : undefined;
        },
        isVariantMetamask: function () {
            const { account } = useAccountStore();
            return account?.variant === AccountVariant.Metamask;
        },
        isAlertErrorShown() {
            return !!this.error;
        },
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
        token: {
            type: Object as PropType<TERC721Token>,
            required: true,
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
