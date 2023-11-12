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
                    <br />
                    <small>{{ token.owner }}</small>
                </div>

                <b-spinner small variant="primary" v-if="!token.tokenId" />
                <div v-else-if="token.nft.variant === NFTVariant.ERC721" class="text-accent fw-bold">
                    #{{ token.tokenId }}
                </div>
                <div v-else-if="token.nft.variant === NFTVariant.ERC1155" class="text-accent fw-bold">
                    {{ Number(balance) }}
                </div>

                <div>
                    <b-dropdown variant="link" size="sm" no-caret toggle-class="py-0">
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-if="isMigrateAvailable" @click="onClickMigrate"> Migrate </b-dropdown-item>
                        <b-dropdown-item
                            v-else
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
            </b-card-title>
        </template>

        <b-collapse v-model="isVisible">
            <div class="px-3 my-3">
                <b-alert v-model="isMigrateAvailable" variant="warning" class="px-3 py-2">
                    <i class="fas fa-exclamation-circle me-1" />
                    Your wallet is not the owner of this token.
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
        isMigrateAvailable() {
            return this.token.recipient !== this.walletStore.wallet?.address;
        },
    },
    mounted() {
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
            try {
                this.isSubmitting = true;
                await this.walletStore.transferERC721(config);
                this.isModalTransferShown = false;
                toast(
                    'Processing transaction...',
                    'dark',
                    45000,
                    () => {},
                    async () => {
                        await this.walletStore.list();
                    },
                );
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
        async onClickMigrate() {
            this.isMigratingTokens = true;
            toast(
                'Transfer to Safe Wallet...',
                'dark',
                15000,
                async () => await this.accountStore.migrate({ erc721TokenId: this.token._id }),
                async () => await this.walletStore.list(),
            );

            this.isMigratingTokens = false;
        },
    },
});
</script>
<style>
a.text-accent {
    text-decoration: none;
}
</style>
