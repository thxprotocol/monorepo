<template>
    <b-button-group class="w-100">
        <b-button
            class="d-flex align-items-center justify-content-center"
            :variant="isConnected ? 'success' : 'primary'"
            :disabled="isConnecting"
            @click="onClick"
        >
            <template v-if="!isConnected">
                <b-img :src="imgWalletConnect" width="20" class="me-2 rounded" />
                Continue with WalletConnect
            </template>
            <template v-else-if="chainId && walletStore.chainId !== chainId">
                <b-img :src="chainList[chainId].logo" width="20" class="me-2 rounded" />
                Switch to {{ chainList[chainId].name }}
            </template>
            <template v-else>
                <b-spinner v-if="isConnecting" small />
                <slot v-else />
            </template>
        </b-button>
        <b-button
            v-if="isConnected"
            class="flex-grow-0"
            variant="success"
            style="width: 50px"
            @click="onClickDisconnect"
        >
            <i class="fas fa-times" />
        </b-button>
    </b-button-group>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { chainList } from '../../utils/chains';
import imgWalletConnect from '../../assets/walletconnect-logo.png';

export default defineComponent({
    name: 'BaseButtonWalletConnect',
    props: {
        chainId: Number,
        message: {
            type: String,
            default: 'This signature will be used to proof ownership of a web3 account.',
        },
    },
    data() {
        return {
            signature: '',
            imgWalletConnect,
            chainList,
            isLoading: false,
            interval: null as any,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isConnecting() {
            return this.isLoading;
        },
        isConnected() {
            return this.walletStore.account && this.walletStore.account.isConnected;
        },
    },
    methods: {
        async onClickDisconnect() {
            await this.walletStore.disconnect();
            window.location.reload();
        },
        async onClick() {
            if (!this.walletStore.account || !this.walletStore.account.isConnected) {
                await this.walletStore.disconnect();
                await this.walletStore.connect();
            } else if (this.chainId && this.walletStore.chainId !== this.chainId) {
                await this.walletStore.switchChain(this.chainId);
            } else {
                this.sign();
            }
        },
        async sign() {
            try {
                this.isLoading = true;
                this.signature = await this.walletStore.signMessage(this.message);

                this.$emit('signed', {
                    signature: this.signature,
                    message: this.message,
                });
            } catch (error) {
                const { code, details, message } = error as any;
                // Indicates connect state in w3modal but not connected in wallet
                if (message === 'connection.connector.getProvider is not a function') {
                    this.$emit('error', 'No wallet connection, please disconnect and try again.');
                }
                // Other exceptions are checked for a code to be present, indicating metamask errors
                else {
                    this.$emit('error', code ? details : message);
                }
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
