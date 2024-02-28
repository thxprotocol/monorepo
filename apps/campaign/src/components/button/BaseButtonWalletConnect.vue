<template>
    <b-button-group class="w-100">
        <b-button
            @click="onClick"
            class="d-flex align-items-center justify-content-center"
            variant="primary"
            :disabled="isConnecting"
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
                <b-spinner small v-if="isConnecting" />
                <slot v-else />
            </template>
        </b-button>
        <b-button
            v-if="isConnected"
            class="flex-grow-0"
            @click="onClickDisconnect"
            variant="primary"
            style="width: 50px"
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
    props: {
        chainId: Number,
        message: {
            type: String,
            default: 'This signature will be used to proof ownership of a web3 account.',
        },
    },
    mounted() {
        this.walletStore.createWeb3Modal();
    },
    methods: {
        onClickDisconnect() {
            window.location.reload();
        },
        onClick() {
            if (!this.walletStore.account) {
                this.walletStore.modal.open();
            } else if (this.chainId && this.walletStore.chainId !== this.chainId) {
                this.walletStore.switchChain(this.chainId);
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
                this.$emit('error', error as string);
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
