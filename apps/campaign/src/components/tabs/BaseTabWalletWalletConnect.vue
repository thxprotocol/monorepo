<template>
    <b-form-group>
        <b-card class="mb-3">
            <strong>Proof ownership</strong>
            <p class="text-opaque">Sign this message using your wallet to confirm it's address.</p>
            <blockquote v-if="!account" class="mb-0">
                <code>
                    <em>{{ message }}</em>
                </code>
            </blockquote>
            <b-form-group v-else label="Address">
                <span class="text-opaque">{{ account.address }}</span>
            </b-form-group>
        </b-card>
    </b-form-group>
    <b-button @click="onClickCreate" :disabled="isLoading" variant="primary" class="w-100">
        <b-spinner small v-if="isLoading" />
        <template v-else> Connect Wallet </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';
import { GetAccountResult, PublicClient, getAccount } from '@wagmi/core';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { signMessage } from '@wagmi/core';
import { chainList } from '../../utils/chains';
import { getModal } from '../../utils/wallet-connect';
import { Web3Modal } from '@web3modal/html';

export default defineComponent({
    name: 'BaseTabWalletWalletConnect',
    data(): {
        account: GetAccountResult<PublicClient> | null;
        modal: Web3Modal | null;
        error: string;
        isModalOpen: boolean;
        isSubmitting: boolean;
        chainList: { [chainId: number]: ChainInfo };
        chainId: ChainId;
        unsubscribe: any;
        variant: WalletVariant;
        walletLogoMap: { [variant: string]: string };
        WalletVariant: { [variant: string]: string };
        message: string;
        signature: string;
        isLoading: boolean;
    } {
        return {
            error: '',
            isModalOpen: false,
            isSubmitting: false,
            variant: WalletVariant.WalletConnect,
            walletLogoMap,
            WalletVariant,
            chainList,
            chainId: ChainId.Polygon,
            modal: null,
            account: null,
            unsubscribe: null,
            message: 'This signature will be used to proof ownership of a web3 account.',
            signature: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
    },
    mounted() {
        const chains = [chainList[ChainId.Polygon].chain];
        const theme = this.accountStore.getTheme();

        this.chainId = ChainId.Polygon;
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
        async onClickCreate() {
            if (!this.modal) return;

            this.error = '';
            this.isLoading = true;

            try {
                this.modal.setDefaultChain(this.chainList[this.chainId].chain);

                await this.modal.openModal();
                await this.waitForConnected();

                this.signature = await signMessage({ message: this.message });

                await this.walletStore.create({
                    variant: this.variant,
                    message: this.message,
                    signature: this.signature,
                });

                this.$emit('close');
            } catch (error) {
                this.error = error as string;
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
