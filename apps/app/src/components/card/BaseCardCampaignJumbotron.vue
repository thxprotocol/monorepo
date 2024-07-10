<template>
    <b-card
        class="bg-splash order-lg-1 mb-3"
        :class="{ 'd-none d-lg-flex': isRouteRanking }"
        body-class="d-flex justify-content-start align-items-center"
        :style="{
            backgroundImage: accountStore.config.backgroundUrl && `url('${accountStore.config.backgroundUrl}')`,
        }"
    >
        <b-container>
            <b-row>
                <b-col lg="7" offset-lg="1" class="pt-lg-5">
                    <div class="d-flex py-3 pt-lg-5 px-lg-0">
                        <b-img :src="accountStore.config.logoUrl" height="50" alt="logo" class="rounded me-3" />
                        <div>
                            <div class="lead text-white">{{ accountStore.config.title }}</div>
                            <p class="text-opaque d-none d-lg-block">
                                {{ accountStore.config.description || 'No description' }}
                            </p>
                        </div>
                    </div>
                </b-col>
                <b-col lg="3">
                    <div class="d-none d-lg-flex align-items-center justify-content-end">
                        <BaseDropdownWallets class="me-3" />
                        <BaseDropdownUserMenu />
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'BaseCardCampaignJumbotron',
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
        isRouteRanking() {
            return !['ranking'].includes(this.$route.name as string);
        },
    },
});
</script>
