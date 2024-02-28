<template>
    <b-alert v-model="isAlertShown" variant="primary" class="p-2">{{ error }}</b-alert>
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
    <BaseButtonWalletConnect :message="message" @signed="onSigned" @error="error = $event">
        Create Wallet
    </BaseButtonWalletConnect>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';

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
        isAlertShown() {
            return !!this.error;
        },
    },
    methods: {
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
