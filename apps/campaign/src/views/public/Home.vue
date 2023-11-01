<template>
    <b-container>
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>
                        Campaign<br />
                        Discovery
                    </h1>
                    <p class="lead mb-4">
                        A single spot to discover all Quest &amp; Reward campaigns for you to join.
                    </p>
                    <b-button @click="onClickStart" variant="primary" class="me-3 px-5">
                        Start Campaign
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button :href="publicUrl" target="_blank" variant="link" class="text-white">
                        Learn more
                    </b-button>
                </div>
            </b-col>
            <b-col lg="5" class="py-4 py-lg-0 offset-lg-3 text-right">
                <b-card class="p-1">
                    <p class="d-flex align-items-center justify-content-between">
                        <div class="text-opaque">
                            <i class="fas fa-star me-2" />
                            Campaign Spotlight
                        </div>
                        <b-button size="sm" variant="primary" href="https://example.com">Join Campaign!</b-button>
                    </p>
                    <iframe
                        width="100%"
                        height="280"
                        src="https://www.youtube.com/embed/ZKqkdNKb3ks?controls=0"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>
                </b-card>
            </b-col>
        </b-row>
        <hr class="mb-5"/>
    </b-container>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <b-row class="mt-5 mb-3">
            <b-col class="d-flex align-items-center">
                <strong class="mb-3 mb-md-0 text-opaque">
                    <i class="fas fa-gift me-1" />
                    Campaigns
                </strong>    
            </b-col>
            <b-col xs="12" md="4">
                <b-input-group class="mb-3 mb-md-0">
                    <template #prepend>
                        <b-input-group-text class="bg-primary">
                            <b-spinner small variant="white" v-if="isLoadingSearch" />
                            <i v-else class="fas fa-search"></i>
                        </b-input-group-text>
                    </template>
                    <b-form-input placeholder="Search..." v-model="search" @input="onInputSearch" />
                </b-input-group>
            </b-col>
            <b-col xs="12" md="4" class="d-flex align-items-center justify-content-end">
                <b-pagination
                    v-model="page"
                    :per-page="limit"
                    :total-rows="campaigns.total"
                    align="center"
                    class="mb-0"
                ></b-pagination>
            </b-col>
        </b-row>
        <b-row :style="{ opacity: isLoadingSearch || isLoadingPage ? 0.5 : 1 }">
            <b-col v-if="isLoading" class="justify-content-center d-flex">
                <b-spinner small variant="primary" />
            </b-col>
            <b-col v-else lg="4" xl="3" :key="key" v-for="(campaign, key) of campaigns.results">
                <BaseCardCampaign :campaign="campaign" />
            </b-col>
            <b-col v-if="!isLoading && !campaigns.results.length">
                <p class="text-opaque">Could not find a campaign with that name...</p>
            </b-col>
        </b-row>
        <hr />
        <b-row class="mt-5 mb-3">
            <b-col md="12" class="d-flex align-items-center pb-3">
                <strong class="mb-3 mb-md-0 text-opaque">
                    <i class="fas fa-trophy me-1" />
                    Quests
                </strong>    
            </b-col>        
            <b-col v-for="quest of questLists" md="3">
                <BaseCardQuest :quest="quest" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseCardQuest from '../../components/BaseCardQuest.vue';
import BaseCardCampaign from '../../components/BaseCardCampaign.vue';
import BaseNavbarSecondary from '../../components/BaseNavbarSecondary.vue';
import { API_URL } from '../../config/secrets';
import imgJumbotron from '../../assets/thx_token_governance.webp';
import imgLogo from '../../assets/logo.png';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { mapStores } from 'pinia';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardQuest,
        BaseCardCampaign,
        BaseNavbarSecondary,
    },
    data(): any {
        return {
            publicUrl: "https://www.thx.network",
            questLists: { daily: [],invite: [],social: [],custom: [],web3: []},
            isLoadingSearch: false,
            isLoadingPage: false,
            isAlertShown: true,
            imgJumbotron,
            imgLogo,
            isLoading: true,
            page: 1,
            limit: 8,
            search: '',
            debouncedSearch: null,
            screenWidth: window.innerWidth,
            campaigns: { results: [], total: 0 },
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
    },
    async mounted() {
        await this.getCampaigns();
        await this.getQuests();
        this.isLoading = false;
    },
    watch: {
        async page(page) {
            this.page = page;
            this.isLoadingPage = true;
            await this.getCampaigns();
            this.isLoadingPage = false;
        }
    },
    methods: {
        onClickStart() {
            window.open('https://dashboard.thx.network', '_blank')
        },
        async getCampaigns() {
            const url = new URL(API_URL);
            url.pathname = '/v1/pools/public';
            url.searchParams.append('page', this.page);
            url.searchParams.append('limit', this.limit);
            if (this.search) {
                url.searchParams.append('search', this.search);
            }
            const res = await fetch(url);
            const campaigns = await res.json();

            this.campaigns = campaigns;
        },
        async getQuests() {
            const url = new URL(API_URL);
            url.pathname = '/v1/quests/public';
            const res = await fetch(url);
            const questLists = await res.json();

            this.questLists = questLists;
        },
        onInputSearch() {
            this.isLoadingSearch = true;
            clearTimeout(this.debouncedSearch);
            this.debouncedSearch = setTimeout(async () => {
                await this.getCampaigns();
                this.isLoadingSearch = false;
            }, 1000);
        }, 
    },
});
</script>

<style>
.pagination {
    --bs-pagination-focus-bg: var(--bs-purple-dark);
    --bs-pagination-focus-color: rgba(255,255,255,.5);;
    --bs-pagination-focus-border-color: var(--bs-purple-dark);

    --bs-pagination-hover-color: white;
    --bs-pagination-hover-bg: var(--bs-purple);
    --bs-pagination-hover-border-color: var(--bs-purple);
    
    --bs-pagination-color: rgba(255,255,255,.5);;
    --bs-pagination-bg: #37277b;
    --bs-pagination-border-color: #37277b;
    
    --bs-pagination-disabled-color: rgba(255,255,255,.25);
    --bs-pagination-disabled-bg: #37277b;
    --bs-pagination-disabled-border-color: #37277b;
}
.form-control {
    border-color: var(--bs-primary);
}
.nav-pills .nav-link {
    text-transform: capitalize;
    color: rgba(255,255,255,0.5 )
}
</style>
