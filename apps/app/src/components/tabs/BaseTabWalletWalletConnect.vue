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
    <b-button v-if="!address" variant="primary" class="w-100" @click="onClickConnect"> Connect Wallet </b-button>
    <b-button v-else variant="success" :disabled="isLoading" class="w-100" @click="onClickAdd">
        <b-spinner v-if="isLoading" small />
        <template v-else>
            Add <strong>{{ walletStore.account.address && shortenAddress(walletStore.account.address) }}</strong>
        </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';
import { shortenAddress } from '@thxnetwork/app/utils/address';
import poll from 'promise-poller';
import { ChainId } from '@thxnetwork/common/enums';

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
        this.walletStore.setWallet(null);
    },
    methods: {
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        async getAddress() {
            const taskFn = async () => {
                return this.walletStore.account.address ? Promise.resolve() : Promise.reject('Account address');
            };
            await poll({ taskFn, interval: 1000, retries: 60 });
            return this.walletStore.account.address;
        },
        async onClickConnect() {
            if (this.walletStore.currentChainId == ChainId.Aptos) {
                if (!window.santaAptos) return;
                try {
                    await window.santaAptos.disconnect();
                } catch (error) {
                    console.log(error);
                }

                try {
                    const response = await window.santaAptos.connect();

                    try {
                        await this.walletStore.create({
                            chainId: ChainId.Aptos,
                            variant: this.variant,
                            rawAddress: response.args.address,
                        });
                        const wallet = this.walletStore.wallets.find(
                            (wallet: TWallet) => wallet.address === response.args.address,
                        );
                        if (!wallet) throw new Error('New wallet not found');

                        this.walletStore.setWallet(wallet);
                        this.$emit('close');
                    } catch (error) {
                        console.error(error);
                        this.error = 'An issue occurred while creating your wallet. Please try again.';
                    } finally {
                        this.isLoading = false;
                    }
                } catch (error) {
                    console.log(error);
                }
            } else if (this.walletStore.currentChainId == ChainId.Sui) {
                console.log('Not supporting Sui at the moment.');
                // try {
                //     if (window.martian.sui._isConnected) await window.martian.sui.disconnect();
                //     const accountInfo = await window.martian.sui.connect(['viewAccount', 'suggestTransactions']);
                //     try {
                //         await this.walletStore.create({
                //             chainId: ChainId.Sui,
                //             variant: this.variant,
                //             rawAddress: accountInfo.address,
                //         });
                //         const wallet = this.walletStore.wallets.find(
                //             (wallet: TWallet) => wallet.address === accountInfo.address,
                //         );
                //         if (!wallet) throw new Error('New wallet not found');

                //         this.walletStore.setWallet(wallet);
                //         this.$emit('close');
                //     } catch (error) {
                //         console.error(error);
                //         this.error = 'An issue occured while creating your wallet. Please try again.';
                //     } finally {
                //         this.isLoading = false;
                //     }
                // } catch (error) {
                //     console.error(error);
                // }
            } else if (this.walletStore.currentChainId == ChainId.Solana) {
                console.log('Not supporting Solana at the moment.');
                // try {
                //     const provider = window.phantom?.solana;
                //     const resp = await provider.connect();
                //     const accountAddress = resp.publicKey.toString();
                //     console.log(accountAddress);
                //     try {
                //         await this.walletStore.create({
                //             chainId: ChainId.Solana,
                //             variant: this.variant,
                //             rawAddress: accountAddress,
                //         });
                //         const wallet = this.walletStore.wallets.find(
                //             (wallet: TWallet) => wallet.address === accountAddress,
                //         );
                //         if (!wallet) throw new Error('New wallet not found');

                //         this.walletStore.setWallet(wallet);
                //         this.$emit('close');
                //     } catch (error) {
                //         console.error(error);
                //         this.error = 'An issue occured while creating your wallet. Please try again.';
                //     } finally {
                //         this.isLoading = false;
                //     }
                // } catch (error) {
                //     console.error(error);
                // }
            } else {
                try {
                    await this.walletStore.disconnect();
                    await this.walletStore.connect();
                    this.address = await this.getAddress();
                } catch (error) {
                    console.error(error);
                    this.error = 'An issue occured while connecting your wallet. Please try again.';
                }
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

                this.walletStore.setWallet(wallet);
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
