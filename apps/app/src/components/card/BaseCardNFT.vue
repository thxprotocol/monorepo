<template>
    <BaseCardPayment
        :reward-variant="RewardVariant.NFT"
        :icon="token.nft && token.nft.logoImgUrl"
        :created-at="token.createdAt"
        header-class="cursor-pointer"
    >
        <template #header>
            <div>
                <div class="d-flex justify-content-start">
                    <div class="me-1">
                        <b-spinner v-if="!token.tokenId" small variant="primary" />
                        <div v-else-if="token.nft.variant === NFTVariant.ERC721" class="text-accent fw-bold">
                            #{{ token.tokenId }}
                        </div>
                        <div v-else-if="token.nft.variant === NFTVariant.ERC1155" class="text-accent fw-bold">
                            {{ Number(balance) }}
                        </div>
                    </div>
                    {{ token.metadata.name }}
                </div>
                <div class="small text-opaque" v-html="token.nft.name" />
            </div>
        </template>

        <template #dropdown-items>
            <b-dropdown-item
                link-class="d-flex justify-content-between align-items-center"
                :disabled="isDisabledTransfer"
                @click.stop="isModalTransferShown = true"
            >
                Transfer
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
            <b-dropdown-item
                :href="blockExplorerURL"
                target="_blank"
                link-class="d-flex justify-content-between align-items-center"
            >
                Block Explorer <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
            <BaseModalERC721Transfer
                :id="`modalNFTTransfer${token.nft._id}`"
                :show="isModalTransferShown"
                :error="error"
                :token="token"
                :is-loading="isSubmitting"
                @hidden="onModalTransferHidden"
                @submit="onSubmitTransfer"
            />
        </template>
        <div class="p-2">
            <b-alert
                v-if="token.nft.variant === NFTVariant.ERC721"
                v-model="isNotOwner"
                variant="warning"
                class="px-3 py-2"
            >
                <i class="fas fa-exclamation-circle me-1" />
                This token is currently owned by:
                <small>{{ owner }}</small>
            </b-alert>

            <b-link :href="token.metadata.imageUrl" target="_blank">
                <b-img lazy :src="token.metadata.imageUrl" class="mb-3" fluid rounded />
            </b-link>
            <b-card-text>
                {{ token.metadata.description }}
            </b-card-text>
            <hr />
            <b-card-text style="font-size: smaller">
                <p class="d-flex align-items-center">
                    <span>Contract</span>
                    <b-link
                        class="ms-auto text-accent"
                        :href="`https://polygonscan.com/token/${token.nft.address}`"
                        target="_blank"
                    >
                        <strong v-b-tooltip :title="token.nft.description" class="ms-auto">
                            {{ token.nft.name }}
                        </strong>
                    </b-link>
                </p>
                <p class="d-flex align-items-center">
                    <span>Website</span>
                    <b-link class="ms-auto text-accent" :href="token.metadata.externalUrl" target="_blank">
                        <strong>
                            <i class="fas fa-external-link-alt"></i>
                        </strong>
                    </b-link>
                </p>
                <p class="d-flex align-items-center">
                    <span>Token ID</span>
                    <b-link v-if="token.tokenId" class="ms-auto text-accent" :href="token.tokenUri" target="_blank">
                        <strong>{{ token.tokenId }}</strong>
                    </b-link>
                    <b-spinner v-else class="ms-auto" small variant="primary" />
                </p>
                <p class="d-flex align-items-center">
                    <span>Token Standard</span>
                    <strong class="ms-auto">{{ token.nft.variant.toUpperCase() }}</strong>
                </p>
                <p v-if="token.nft.variant === NFTVariant.ERC1155" class="d-flex align-items-center">
                    <span>Balance</span>
                    <strong class="ms-auto">{{ balance }}</strong>
                </p>
                <p v-if="token.nft && token.nft.symbol" class="d-flex align-items-center">
                    <span>Symbol</span>
                    <strong class="ms-auto">{{ token.nft.symbol }}</strong>
                </p>
            </b-card-text>
        </div>
    </BaseCardPayment>
</template>

<script lang="ts">
import poll from 'promise-poller';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { NFTVariant } from '../../types/enums/nft';
import { useAccountStore } from '../../stores/Account';
import { toast } from '../../utils/toast';
import { WalletVariant } from '../../types/enums/accountVariant';
import { RewardVariant } from '@thxnetwork/common/enums';
import { chainList } from '@thxnetwork/app/utils/chains';

export default defineComponent({
    name: 'BaseCardNFT',
    props: {
        token: {
            type: Object as PropType<TERC721Token>,
            required: true,
        },
    },
    data: function () {
        return {
            owner: '',
            RewardVariant,
            NFTVariant,
            balance: '',
            isVisible: false,
            isModalTransferShown: false,
            isMigratingTokens: false,
            error: '',
            isSubmitting: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        blockExplorerURL() {
            if (!this.walletStore.wallet) return;
            return (
                chainList[this.token.chainId].blockExplorer +
                '/token/' +
                this.token.nft.address +
                '?a=' +
                this.walletStore.wallet.address
            );
        },
        isNotOwner() {
            if (!this.walletStore.wallet) return false;
            const { address } = this.walletStore.wallet;
            return this.owner ? this.owner !== address : false;
        },
        isDisabledTransfer() {
            return this.walletStore.wallet?.variant !== WalletVariant.Safe;
        },
    },
    watch: {
        isVisible(state: boolean) {
            if (!state) return;
            this.getToken();
        },
    },
    mounted() {
        if (!this.token.tokenId) this.waitForMinted();
        this.getToken();
    },
    methods: {
        getToken() {
            const getTokenMap: { [variant: string]: (wallet: TWallet) => void } = {
                [NFTVariant.ERC721]: this.getERC721Token.bind(this),
                [NFTVariant.ERC1155]: this.getERC1155Token.bind(this),
            };
            const wallet = this.walletStore.wallet;
            if (!wallet) return;

            getTokenMap[this.token.nft.variant](wallet);
        },
        async getERC721Token(wallet: TWallet) {
            const token = await this.accountStore.api.request.get(`/v1/erc721/token/${this.token._id}`, {
                params: { walletId: wallet._id },
            });
            this.owner = token.owner;
        },
        async getERC1155Token(wallet: TWallet) {
            const token = await this.accountStore.api.request.get(`/v1/erc1155/token/${this.token._id}`, {
                params: { walletId: wallet._id },
            });
            this.balance = token.balance;
        },
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        async onSubmitTransfer(config: TNFTTransferConfig) {
            try {
                this.isSubmitting = true;
                await this.walletStore.transfer(config);
                this.isModalTransferShown = false;
                toast('Processing transaction...', 'dark', 45000, this.walletStore.list);
            } catch (error) {
                this.error = 'Transaction failed';
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        async waitForMinted() {
            const taskFn = async () => {
                await this.walletStore.getERC721Token(this.token);
                return this.token.tokenId ? Promise.resolve() : Promise.reject('Could not find token for ID');
            };
            return await poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});
</script>
<style>
a.text-accent {
    text-decoration: none;
}
</style>
