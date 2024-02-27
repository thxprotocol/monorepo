<template>
    <b-button @click="onClickConnect" :disabled="isConnecting" variant="primary" class="w-100">
        <b-spinner small v-if="isConnecting" />
        <slot v-else> Connect Wallet </slot>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { chainList } from '../../utils/chains';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { AUTH_URL, WALLET_CONNECT_PROJECT_ID, WIDGET_URL } from '../../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { watchAccount, disconnect, signMessage, getAccount } from '@wagmi/core';

enum WCModalEvent {
    Open = 'MODAL_OPEN',
    Close = 'MODAL_CLOSE',
}

export default defineComponent({
    name: 'BaseButtonWalletConnect',
    data() {
        return {
            signature: '',
            account: null as any,
            modal: null as any,
            wagmiConfig: null,
            chainList,
            isLoading: false,
            isModalOpen: false,
            interval: null as any,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isConnecting() {
            return this.isModalOpen && this.isLoading;
        },
    },
    props: {
        chainId: {
            type: Number,
            default: ChainId.Ethereum,
        },
        message: {
            type: String,
            default: 'This signature will be used to proof ownership of a web3 account.',
        },
    },
    async mounted() {
        const wagmiConfig = defaultWagmiConfig({
            chains: [chainList[this.chainId].chain],
            projectId: WALLET_CONNECT_PROJECT_ID,
            metadata: {
                name: 'THX Network',
                description: 'THX Network Campaign Discovery',
                url: WIDGET_URL,
                icons: [AUTH_URL + '/img/logo.png'],
            },
        });

        await disconnect(wagmiConfig);

        this.modal = createWeb3Modal({
            wagmiConfig,
            projectId: WALLET_CONNECT_PROJECT_ID,
            defaultChain: chainList[this.chainId].chain,
            themeMode: 'dark',
            privacyPolicyUrl: '',
        });

        watchAccount(wagmiConfig, {
            onChange: this.onAccountChanged,
        });

        this.modal.subscribeEvents(async (event: { data: { event: string } }) => {
            const map: { [event: string]: () => Promise<void> } = {
                [WCModalEvent.Open]: this.onModalOpen.bind(this),
                [WCModalEvent.Close]: this.onModalClose.bind(this),
            };
            if (map[event.data.event]) await map[event.data.event]();
        });
    },
    methods: {
        async onModalOpen() {
            this.isModalOpen = true;
        },
        async onModalClose() {
            this.isModalOpen = false;
        },
        async onAccountChanged(account: any) {
            if (!account || !account.isConnected) return;
            this.account = account;

            // Only sign immediately if the modal is open and the account changed
            if (this.isModalOpen) {
                await this.sign();
            }
        },
        async onClickConnect() {
            await this.disconnect();
            await this.modal.open();
        },
        async disconnect() {
            this.account = getAccount(this.modal.wagmiConfig);
            if (this.account && this.account.isConnected) {
                await disconnect(this.modal.wagmiConfig);
            }
        },
        async sign() {
            try {
                this.isLoading = true;
                this.signature = await signMessage(this.modal.wagmiConfig, {
                    account: this.account,
                    message: this.message,
                });

                this.$emit('signed', {
                    signature: this.signature,
                    message: this.message,
                    address: this.account.address,
                });
            } catch (error) {
                this.$emit('error', error as string);
                await this.disconnect();
                await this.modal.close();
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
