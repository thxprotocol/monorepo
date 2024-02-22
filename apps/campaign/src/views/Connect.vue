<template>
    <b-container class="py-5">
        <b-row>
            <b-col xl="6" offset-xl="3">
                <b-card>
                    <b-alert v-model="isSuccess" variant="success" dismissible class="p-2">
                        Your wallet is now connected!
                    </b-alert>
                    <b-alert v-model="isAlertErrorShown" variant="primary" dismissible class="p-2">
                        {{ error }}
                    </b-alert>
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
                    <BaseButtonWalletConnect @signed="onSigned" @error="error = $event" />
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseButtonWalletConnect from '../components/button/BaseButtonWalletConnect.vue';
import { useWalletStore } from '../stores/Wallet';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { WalletVariant } from '../types/enums/accountVariant';

export default defineComponent({
    name: 'ViewWalletConnect',
    components: { BaseButtonWalletConnect },
    data() {
        return {
            variant: WalletVariant.WalletConnect,
            uuid: '',
            error: '',
            address: '',
            signature: '',
            message: 'This signature will be used to proof ownership of a web3 account.',
            isLoading: false,
            isSuccess: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
        isAlertErrorShown() {
            return !!this.error;
        },
    },
    mounted() {
        if (!this.$route.params.uuid) {
            this.error = 'No access token found in URL.';
        } else {
            this.uuid = this.$route.params.uuid;
        }
    },
    methods: {
        async onSigned({ address, signature }: { signature: string; address: string; message: string }) {
            this.address = address;
            this.signature = signature;

            try {
                await this.walletStore.connect({
                    uuid: this.uuid,
                    variant: this.variant,
                    message: this.message,
                    signature: this.signature,
                });
                this.isSuccess = true;
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
