<template>
    <b-form-group>
        <template #description>
            This reward requires a crypto wallet for your account.
            <b-link @click="onClickAdd">Add a new wallet</b-link>
        </template>
        <b-form-select v-model="wallet" placeholder="Choose a wallet">
            <b-form-select-option :value="null" disabled>Choose a wallet...</b-form-select-option>
            <b-form-select-option v-for="wallet in wallets" :value="wallet" :disabled="chainId !== wallet.chainId">
                {{ wallet.short }}
                ({{ wallet.variant }})
            </b-form-select-option>
        </b-form-select>
    </b-form-group>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { chainList } from '../../utils/chains';
import { WalletVariant } from '../../types/enums/accountVariant';
import { useWalletStore } from '../../stores/Wallet';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    data() {
        return { chainList, wallet: null };
    },
    computed: {
        ...mapStores(useWalletStore),
        wallets() {
            return this.walletStore.wallets.filter((wallet: TWallet) =>
                [WalletVariant.Safe, WalletVariant.WalletConnect].includes(wallet.variant),
            );
        },
    },
    watch: {
        wallet(wallet: TWallet) {
            this.$emit('update', wallet);
        },
    },
    props: {
        chainId: {
            type: Number,
            required: true,
        },
    },
    methods: {
        onClickAdd() {
            this.walletStore.isModalWalletCreateShown = true;
        },
    },
});
</script>
