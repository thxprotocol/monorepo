<template>
    <b-form-group :description="description">
        <b-input-group>
            <b-form-select v-model="walletModel" placeholder="Choose a wallet" class="select-bg">
                <b-form-select-option :value="null" disabled>Choose a wallet...</b-form-select-option>
                <b-form-select-option
                    v-for="w in wallets"
                    :value="w"
                    :disabled="
                        w.variant === WalletVariant.Safe ||
                        (chainId == ChainId.Aptos && w.chainId !== ChainId.Aptos) ||
                        (chainId !== ChainId.Aptos && w.chainId == ChainId.Aptos) ||
                        (chainId == ChainId.Sui && w.chainId !== ChainId.Sui) ||
                        (chainId !== ChainId.Sui && w.chainId == ChainId.Sui) ||
                        (chainId == ChainId.Solana && w.chainId !== ChainId.Solana) ||
                        (chainId !== ChainId.Solana && w.chainId == ChainId.Solana)
                    "
                >
                    {{ w.short }}
                    ({{ w.variant }})
                </b-form-select-option>
            </b-form-select>
            <template #append>
                <b-button variant="primary" class="rounded" style="padding: 0.75rem" @click="onClickAdd">
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
import { ChainId } from '@thxnetwork/common/enums';

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
        return { chainList, WalletVariant, ChainId };
    },
    computed: {
        ...mapStores(useWalletStore),
        walletModel: {
            get() {
                return this.wallet;
            },
            set(value: TWallet) {
                this.$emit('update', value);
            },
        },
        wallets() {
            alert(this.walletStore.wallets);
            return this.walletStore.wallets.filter((wallet: TWallet) => this.variants.includes(wallet.variant));
        },
    },
    methods: {
        onClickAdd() {
            this.walletStore.currentChainId = this.chainId;
            this.walletStore.isModalWalletCreateShown = true;
        },
    },
});
</script>
<style scoped>
.select-bg {
    background: var(--border-as-nav-color);
    border-color: var(--nav-border-color);
    border-radius: 0.375rem !important;
    margin-right: 4px;
    appearance: auto;
}
</style>
