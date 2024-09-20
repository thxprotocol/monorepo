<template>
    <b-modal
        v-model="walletStore.isModalWalletShown"
        hide-footer
        centered
        hide-header-close
        title-class="d-flex align-items-center justify-content-between w-100"
    >
        <template #title>
            {{ title }}
            <b-link class="ms-auto text-white text-opaque" @click="walletStore.isModalWalletShown = false">
                <BaseIcon icon="times" />
            </b-link>
        </template>

        <template v-if="!walletStore.account">
            <b-button
                v-for="v in variants"
                class="w-100 rounded d-flex align-items-center mb-3 text-start"
                variant="primary"
                @click="onClickVariant(v.variant)"
            >
                <!-- <b-img :src="v.img" width="20" class="me-2 rounded" /> -->
                <div class="d-flex flex-column">
                    <div class="w-100">{{ v.name }}</div>
                    <p class="mb-0 text-opaque">{{ v.label }}</p>
                </div>
                <div class="ps-2 ms-auto">
                    <BaseIcon icon="chevron-right" />
                </div>
            </b-button>
        </template>

        <template
            v-if="variant === WalletVariant.WalletConnect && walletStore.account && walletStore.account.isConnected"
        >
            <code>{{ message }}</code>
            <p class="text-muted">By signing this message, you agree with the general terms and conditions.</p>
            <b-button variant="primary" class="w-100" @click="onClickSign">
                <b-spinner v-if="isLoadingSign" small />
                <template v-else>
                    Sign with
                    <strong> {{ address?.substring(0, 10) }} </strong>...
                    <BaseIcon icon="chevron-right" class="ms-3" />
                </template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useWalletStore } from '@thxnetwork/wallet/stores';
import { WalletVariant } from '@thxnetwork/common/enums';
import { toast } from '@thxnetwork/wallet/utils/toast';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgWalletConnectLogo from '../assets/walletconnect-logo.png';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isLoadingSign: false,
            title: 'Connect Your Wallet',
            message: '',
            WalletVariant,
            variants: [
                {
                    img: imgSafeLogo,
                    variant: WalletVariant.WalletConnect,
                    name: 'WalletConnect',
                    label: 'For Metamask and other providers',
                },
                {
                    img: imgWalletConnectLogo,
                    variant: WalletVariant.Safe,
                    name: 'Safe',
                    label: "If you don't own a wallet. Easy to use.",
                },
            ],
            variant: null as WalletVariant | null,
            email: '',
            imgWalletConnect: '',
            imgSafe: '',
            address: '' as `0x${string}` | undefined,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
    mounted() {
        this.walletStore.createWeb3Modal();
    },
    methods: {
        async onClickVariant(variant: WalletVariant) {
            this.variant = variant;

            switch (variant) {
                case WalletVariant.WalletConnect: {
                    this.createWalletConnect();
                    break;
                }
                case WalletVariant.Safe:
                    // this.walletStore.createSafe();
                    break;
            }
        },
        async createWalletConnect() {
            try {
                await this.walletStore.disconnect();
                await this.walletStore.connect();
                this.address = await this.getAddress();
                this.title = 'Sign for access';
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            }
        },
        async getAddress() {
            const taskFn = async () => {
                return this.walletStore.account?.address ? Promise.resolve() : Promise.reject('Account address');
            };
            await poll({ taskFn, interval: 1000, retries: 60 });
            return this.walletStore.account?.address;
        },
        async onClickSign() {
            try {
                const message = 'blabla';
                const signature = await this.walletStore.signMessage(message);
                this.isLoadingSign = true;
                await this.walletStore.create({
                    variant: this.variant as WalletVariant,
                    message,
                    signature,
                });
                this.walletStore.isModalWalletShown = false;
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoadingSign = false;
            }
        },
    },
});
</script>
