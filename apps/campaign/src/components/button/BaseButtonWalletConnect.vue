<template>
    <b-button @click="onClickConnect" :disabled="isLoading" variant="primary" class="w-100">
        <b-spinner small v-if="isLoading" />
        <slot v-else> Connect Wallet </slot>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { GetAccountResult, PublicClient, getAccount } from '@wagmi/core';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { signMessage } from '@wagmi/core';
import { chainList } from '../../utils/chains';
import { getModal } from '../../utils/wallet-connect';
import { Web3Modal } from '@web3modal/html';

export default defineComponent({
    name: 'BaseButtonWalletConnect',
    data(): {
        account: GetAccountResult<PublicClient> | null;
        modal: Web3Modal | null;
        isModalOpen: boolean;
        chainList: { [chainId: number]: ChainInfo };
        unsubscribe: any;
        isLoading: boolean;
    } {
        return {
            account: null,
            modal: null,
            isModalOpen: false,
            chainList,
            unsubscribe: null,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
    },
    props: {
        chainId: {
            type: Number,
            default: ChainId.Polygon,
        },
        message: {
            type: String,
            default: 'This signature will be used to proof ownership of a web3 account.',
        },
    },
    mounted() {
        const chains = [chainList[this.chainId].chain];
        const theme = this.accountStore.poolId && this.accountStore.getTheme();

        this.modal = getModal(chainList[this.chainId].chain, chains, theme);
        this.unsubscribe = this.modal.subscribeModal(this.onModalStateChange);
    },
    methods: {
        waitForConnected() {
            return new Promise((resolve) => {
                setInterval(() => {
                    if (this.account?.isConnected) resolve('connected');
                }, 500);
            });
        },
        onModalStateChange({ open }: { open: boolean }) {
            this.isModalOpen = open;
            this.account = getAccount();
        },
        async onClickConnect() {
            if (!this.modal) return;

            this.isLoading = true;

            try {
                this.modal.setDefaultChain(this.chainList[this.chainId].chain);

                await this.modal.openModal();
                await this.waitForConnected();

                const signature = await signMessage({ message: this.message });

                if (!this.account) throw new Error('Not able to get the account.');

                this.$emit('signed', { signature, message: this.message, address: this.account.address });
            } catch (error) {
                this.$emit('error', error as string);
                this.modal.closeModal();
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

<style lang="scss">
body {
    --w3m-z-index: 1500;
}
</style>
