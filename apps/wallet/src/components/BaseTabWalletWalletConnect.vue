<template>
    <b-alert v-model="isAlertShown" variant="primary" class="p-2">{{ error }}</b-alert>
    <b-form-group label="Proof ownership">
        <p class="text-opaque">Sign this message using your wallet to confirm it's address.</p>
        <blockquote class="mb-0">
            <code>
                <em>{{ message }}</em>
            </code>
        </blockquote>
    </b-form-group>
    <b-form-group v-if="address" label="Address">
        <span class="text-opaque">{{ address }}</span>
    </b-form-group>
    <b-button v-if="!address" variant="primary" class="w-100 mt-3" @click="onClickConnect"> Connect Wallet </b-button>
    <b-button v-else variant="success" :disabled="isLoading" class="w-100 mt-3" @click="onClickAdd">
        <b-spinner v-if="isLoading" small />
        <template v-else>
            Add <strong>{{ walletStore.account?.address && shortenAddress(walletStore.account.address) }}</strong>
        </template>
    </b-button>
</template>

<script lang="ts">
import { WalletVariant } from '@thxnetwork/common/enums';
import { useAccountStore, useAuthStore, useWalletStore } from '@thxnetwork/wallet/stores';
import { shortenAddress } from '@thxnetwork/wallet/utils/address';
import { mapStores } from 'pinia';
import poll from 'promise-poller';
import { defineComponent } from 'vue';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgWalletConnectLogo from '../assets/walletconnect-logo.png';

export default defineComponent({
    name: 'BaseTabWalletWalletConnect',
    data() {
        return {
            error: '',
            variant: WalletVariant.WalletConnect,
            address: '' as `0x${string}` | undefined,
            walletLogoMap: {
                [WalletVariant.WalletConnect]: imgWalletConnectLogo,
                [WalletVariant.Safe]: imgSafeLogo,
            },
            WalletVariant,
            message: 'This signature will be used to proof ownership of a web3 account.',
            signature: '',
            isLoading: false,
            shortenAddress,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isAlertShown() {
            return !!this.error;
        },
    },
    mounted() {
        this.walletStore.set(null);
    },
    methods: {
        async getAddress() {
            const taskFn = async () => {
                return this.walletStore.account?.address ? Promise.resolve() : Promise.reject('Account address');
            };
            await poll({ taskFn, interval: 1000, retries: 60 });
            return this.walletStore.account?.address;
        },
        async onClickConnect() {
            try {
                await this.walletStore.disconnect();
                await this.walletStore.connect();
                this.address = await this.getAddress();
            } catch (error) {
                console.error(error);
                this.error = 'An issue occured while connecting your wallet. Please try again.';
            }
        },
        async onClickAdd() {
            this.isLoading = true;
            try {
                const signature = await this.walletStore.signMessage(this.message);
                await this.walletStore.create({
                    chainId: this.walletStore.chainId,
                    variant: this.variant,
                    message: this.message,
                    signature,
                });
                const wallet = this.walletStore.wallets.find((wallet: TWallet) => wallet.address === this.address);
                if (!wallet) throw new Error('New wallet not found');

                this.walletStore.set(wallet);
                this.$emit('close');
            } catch (error) {
                console.error(error);
                this.error = 'An issue occured while creating your wallet. Please try again.';
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
