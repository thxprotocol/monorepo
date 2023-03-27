<template>
    <BaseCardCollapse :visible="isVisible">
        <template #header>
            <div class="pe-3">
                <img height="25" :src="token.erc721.logoImgUrl" />
            </div>
            <div class="flex-grow-1">
                <strong>{{ token.metadata.name }}</strong>
            </div>
            <div class="text-accent fw-bold">#{{ token.tokenId }}</div>
            <!-- <div>
                <b-dropdown variant="link" size="sm" no-caret>
                    <template #button-content>
                        <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                    </template>
                    <b-dropdown-item> Transfer </b-dropdown-item>
                </b-dropdown>
            </div> -->
        </template>

        <b-link :href="token.metadata.imageUrl">
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
                    :href="`https://polygonscan.com/address/${token.erc721.address}`"
                    target="_blank"
                >
                    <strong v-b-tooltip :title="token.erc721.description" class="ms-auto">
                        {{ token.erc721.name }}
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
                <b-link class="ms-auto text-accent" :href="token.tokenUri" target="_blank">
                    <strong>{{ token.tokenId }}</strong>
                </b-link>
            </p>
            <p class="d-flex align-items-center">
                <span>Token Standard</span>
                <strong class="ms-auto">ERC-721</strong>
            </p>
            <p class="d-flex align-items-center">
                <span>Symbol</span>
                <strong class="ms-auto">{{ token.erc721.symbol }}</strong>
            </p>
        </b-card-text>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../stores/Wallet';
import { mapStores } from 'pinia';
import BaseCardCollapse from './BaseCardCollapse.vue';

export default defineComponent({
    name: 'BaseCardERC721',
    components: {
        BaseCardCollapse,
    },
    props: {
        token: {
            type: Object as PropType<TERC721Token>,
            required: true,
        },
    },
    data: function () {
        return { isVisible: false, isModalUpgradeShown: false, error: '', isSubmitting: false };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
});
</script>
<style>
a.text-accent {
    text-decoration: none;
}
</style>
