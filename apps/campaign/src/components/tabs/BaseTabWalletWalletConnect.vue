<template>
    <b-form-group>
        <strong>Proof ownership</strong>
        <p class="text-opaque">Sign this message using your wallet to confirm it's address.</p>
        <blockquote v-if="!address" class="mb-0">
            <code>
                <em>{{ message }}</em>
            </code>
        </blockquote>
        <b-form-group v-else label="Address">
            <span class="text-opaque">{{ address }}</span>
        </b-form-group>
    </b-form-group>
    <b-button
        v-if="accountStore.isMobileEthereumBrowser"
        @click="onClickDeeplink"
        :disabled="isLoading"
        variant="primary"
        class="w-100"
    >
        <b-spinner small v-if="isLoading" />
        <template v-else> Open WalletConnect </template>
    </b-button>
    <BaseButtonWalletConnect v-else @signed="onSigned" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';
import { WIDGET_URL } from '../../config/secrets';

export default defineComponent({
    name: 'BaseTabWalletWalletConnect',
    data() {
        return {
            error: '',
            variant: WalletVariant.WalletConnect,
            address: '',
            walletLogoMap,
            WalletVariant,
            message: 'This signature will be used to proof ownership of a web3 account.',
            signature: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
    },
    methods: {
        deeplink(uuid: string) {
            const url = new URL(WIDGET_URL);
            const deeplink = `https://metamask.app.link/dapp/${url.host}/connect/${uuid}`;
            window.open(deeplink, '_blank');
        },
        async onClickDeeplink() {
            try {
                await this.walletStore.create({ variant: WalletVariant.WalletConnect });
                const wallet = this.walletStore.wallets.find(
                    (wallet) => wallet.variant === WalletVariant.WalletConnect && !wallet.address,
                );
                if (!wallet) throw new Error('Failed to create wallet');

                this.deeplink(wallet.uuid);
            } catch (error) {
                this.$emit('error', error as string);
            }
        },
        async onSigned({ address, signature }: { signature: string; address: string; message: string }) {
            this.address = address;
            this.signature = signature;

            try {
                await this.walletStore.create({
                    variant: this.variant,
                    message: this.message,
                    signature: this.signature,
                });

                this.$emit('close');
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
