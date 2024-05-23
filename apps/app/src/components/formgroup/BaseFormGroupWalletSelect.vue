<template>
    <b-form-group :description="description">
        <b-input-group>
            <b-form-select v-model="walletModel" placeholder="Choose a wallet">
                <b-form-select-option :value="null" disabled>Choose a wallet...</b-form-select-option>
                <b-form-select-option
                    v-for="w in wallets"
                    :value="w"
                    :disabled="chainId ? chainId !== w.chainId : false"
                >
                    {{ w.short }}
                    ({{ w.variant }})
                </b-form-select-option>
            </b-form-select>
            <template #append>
                <b-button variant="primary" class="rounded" @click="onClickAdd">
                    <i class="fas fa-plus"></i>
                </b-button>
            </template>
        </b-input-group>
    </b-form-group>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { chainList } from '../../utils/chains';
import { WalletVariant } from '../../types/enums/accountVariant';
import { useWalletStore } from '../../stores/Wallet';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    props: {
        chainId: Number,
        description: String,
        wallet: {
            type: Object as PropType<TWallet>,
            default: null,
        },
        variants: {
            type: Array,
            default: () => [WalletVariant.Safe, WalletVariant.WalletConnect],
        },
    },
    data() {
        return { chainList };
    },
    computed: {
        ...mapStores(useWalletStore),
        walletModel: {
            get() {
                return this.wallet;
            },
            set(value: TWallet) {
                if (this.wallets.includes(value)) {
                    this.$emit('update', value);
                } else {
                    this.$emit('update', null);
                }
            },
        },
        wallets() {
            return this.walletStore.wallets.filter((wallet: TWallet) => this.variants.includes(wallet.variant));
        },
    },
    methods: {
        onClickAdd() {
            this.walletStore.isModalWalletCreateShown = true;
        },
    },
});
</script>
