<template>
    <BaseCardCollapse :visible="isVisible">
        <template #header>
            <div class="pe-3">
                <img height="25" :src="token.nft.logoImgUrl" />
            </div>
            <div class="flex-grow-1">
                <strong>{{ token.metadata.name }}</strong>
                <br />
                <small>{{ token.owner }}</small>
            </div>

            <b-spinner small variant="primary" v-if="!token.tokenId" />
            <div v-else-if="token.nft.variant === NFTVariant.ERC721" class="text-accent fw-bold">
                #{{ token.tokenId }}
            </div>
            <div v-else-if="token.nft.variant === NFTVariant.ERC1155" class="text-accent fw-bold">
                {{ Number(balance).toFixed(2) }}
            </div>

            <div>
                <b-dropdown variant="link" size="sm" no-caret>
                    <template #button-content>
                        <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                    </template>
                    <b-dropdown-item
                        :disabled="
                            token.nft.variant === NFTVariant.ERC1155 ||
                            (walletStore.wallet?.version &&
                                walletStore.wallet?.version !== walletStore.wallet?.latestVersion)
                        "
                        @click.stop="isModalTransferShown = true"
                    >
                        Transfer
                    </b-dropdown-item>
                </b-dropdown>
                <BaseModalERC721Transfer
                    v-if="token.nft.variant === NFTVariant.ERC721"
                    :id="`modalERC721Transfer${token.nft._id}`"
                    :show="isModalTransferShown"
                    :error="error"
                    :token="token"
                    :is-loading="isSubmitting"
                    @hidden="onModalTransferHidden"
                    @submit="onSubmitTransfer"
                />
            </div>
        </template>

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
                    :href="`https://polygonscan.com/address/${token.nft.address}`"
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
    </BaseCardCollapse>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../stores/Wallet';
import { mapStores } from 'pinia';
import BaseCardCollapse from './BaseCardCollapse.vue';
import BaseModalERC721Transfer from './BaseModalERC721Transfer.vue';
import poll from 'promise-poller';
import { NFTVariant } from '../types/enums/nft';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'BaseCardERC721',
    components: {
        BaseCardCollapse,
        BaseModalERC721Transfer,
    },
    props: {
        token: {
            type: Object as PropType<TERC721Token>,
            required: true,
        },
    },
    data: function () {
        return {
            NFTVariant,
            balance: '',
            isVisible: false,
            isModalTransferShown: false,
            error: '',
            isSubmitting: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
    async mounted() {
        if (!this.token.tokenId) {
            this.waitForMinted();
        } else {
            if (this.token.nft.variant === NFTVariant.ERC1155) {
                const { api } = useAccountStore();
                api.erc1155.get(this.token._id).then(({ balance }: TERC721Token) => {
                    this.balance = balance;
                });
            }
        }
    },
    methods: {
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        async onSubmitTransfer(config: TERC721TransferConfig) {
            this.isSubmitting = true;
            await this.walletStore.transferERC721(config);
            await this.walletStore.list();
            this.isModalTransferShown = false;
            this.isSubmitting = false;
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
