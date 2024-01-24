<template>
    <b-card
        class="mb-1"
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        :class="{ 'card-collapsed': isVisible }"
    >
        <template #header>
            <b-card-title
                @click.stop="isVisible = !isVisible"
                class="d-flex p-3 m-0 align-items-center"
                style="cursor: pointer"
            >
                <div class="pe-3" v-if="token.nft">
                    <img height="25" :src="token.nft.logoImgUrl" />
                </div>
                <div class="flex-grow-1">
                    <strong>{{ token.metadata.name }}</strong>
                </div>

                <b-spinner small variant="primary" v-if="!token.tokenId" />
                <div v-else-if="token.nft.variant === NFTVariant.ERC721" class="text-accent fw-bold">
                    #{{ token.tokenId }}
                </div>
                <div v-else-if="token.nft.variant === NFTVariant.ERC1155" class="text-accent fw-bold">
                    {{ Number(balance) }}
                </div>

                <div>
                    <b-dropdown variant="link" size="sm" no-caret end toggle-class="py-0">
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item @click.stop="isModalTransferShown = true"> Transfer </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalERC721Transfer
                        :id="`modalNFTTransfer${token.nft._id}`"
                        :show="isModalTransferShown"
                        :error="error"
                        :token="token"
                        :is-loading="isSubmitting"
                        @hidden="onModalTransferHidden"
                        @submit="onSubmitTransfer"
                    />
                </div>
            </b-card-title>
        </template>

        <b-collapse v-model="isVisible">
            <div class="px-3 my-3">
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
                    <p class="d-flex align-items-center" v-if="token.nft.variant === NFTVariant.ERC1155">
                        <span>Balance</span>
                        <strong class="ms-auto">{{ balance }}</strong>
                    </p>
                    <p class="d-flex align-items-center" v-if="token.nft && token.nft.symbol">
                        <span>Symbol</span>
                        <strong class="ms-auto">{{ token.nft.symbol }}</strong>
                    </p>
                </b-card-text>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import poll from 'promise-poller';
import { NFTVariant } from '../../types/enums/nft';
import { useAccountStore } from '../../stores/Account';
import { toast } from '../../utils/toast';

export default defineComponent({
    name: 'BaseCardERC721',
    props: {
        token: {
            type: Object as PropType<TERC721Token>,
            required: true,
        },
    },
    data: function () {
        return {
            owner: '',
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
        isNotOwner() {
            if (!this.walletStore.wallet) return;
            const { address } = this.walletStore.wallet;
            return this.owner && this.owner !== address;
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
            const getTokenMap: { [variant: string]: () => void } = {
                [NFTVariant.ERC721]: this.getERC721Token.bind(this),
                [NFTVariant.ERC1155]: this.getERC1155Token.bind(this),
            };
            getTokenMap[this.token.nft.variant]();
        },
        async getERC721Token() {
            const { api } = useAccountStore();
            const token = await api.erc721.get(this.token._id);
            this.owner = token.owner;
        },
        async getERC1155Token() {
            const { api } = useAccountStore();
            const token = await api.erc1155.get(this.token._id);
            this.balance = token.balance;
        },
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        async transferERC721() {},
        async transferERC1155() {},
        async onSubmitTransfer(config: TNFTTransferConfig) {
            try {
                this.isSubmitting = true;
                await this.walletStore.transfer(config);
                this.isModalTransferShown = false;
                toast('Processing transaction...', 'dark', 45000, () => {}, this.walletStore.list);
            } catch (error) {
                this.error = 'Transaction failed';
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        waitForMinted() {
            const taskFn = async () => {
                this.walletStore.getERC721Token(this.token);
                return this.token.tokenId ? Promise.resolve() : Promise.reject('Could not find token for ID');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});
</script>
<style>
a.text-accent {
    text-decoration: none;
}
</style>
