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
import { chainList } from '../../utils/chains';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { AUTH_URL, WALLET_CONNECT_PROJECT_ID, WIDGET_URL } from '../../config/secrets';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { watchAccount, disconnect, signMessage } from '@wagmi/core';

export default defineComponent({
    name: 'BaseButtonWalletConnect',
    data() {
        return {
            signature: '',
            account: null as any,
            modal: null as any,
            wagmiConfig: null,
            isModalOpen: false,
            chainList,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
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
            onChange: (a) => {
                this.account = a;
            },
        });
    },
    methods: {
        waitForAccount() {
            return new Promise((resolve: any) => {
                const interval = setInterval(() => {
                    if (this.account && this.account.isConnected) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        },
        async onClickConnect() {
            if (!this.modal) return;

            this.isLoading = true;

            try {
                if (!this.account) await this.modal.open();
                await this.waitForAccount();
                if (!this.account) throw new Error('Could not connect to wallet');

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
                this.modal.close();
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
