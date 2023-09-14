<template>
    <div>
        <b-container>
            <!-- <b-navbar class="navbar-top pt-3 px-lg-3 p-lg-0"></b-navbar> -->
            <b-row class="py-md-5">
                <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                    <div>
                        <h1 class="mb-3">
                            Campaign<br />
                            Discovery
                        </h1>
                        <p class="lead mb-4">
                            A single spot to discover all Quest &amp; Reward campaigns for you to join.
                        </p>
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
                            src="https://www.youtube.com/embed/1p0sw4yBTfo?si=Q8CnyNHsDIwcqVx7?controls=0"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                        ></iframe>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <hr />
        <b-row>
            <b-col>
                <b-input-group>
                    <template #prepend>
                        <b-input-group-text class="bg-primary">
                            <b-spinner small variant="white" v-if="isLoadingSearch" />
                            <i v-else class="fas fa-search"></i>
                        </b-input-group-text>
                    </template>
                    <b-form-input placeholder="Search..." v-model="search" @input="onInputSearch" />
                </b-input-group>
            </b-col>
            <b-col class="d-flex align-items-center justify-content-end">
                <b-pagination
                    v-model="page"
                    :per-page="limit"
                    :total-rows="campaigns.total"
                    align="center"
                    class="mb-0"
                ></b-pagination>
            </b-col>
        </b-row>
        <hr />
        <b-row :style="{ opacity: isLoadingSearch || isLoadingPage ? 0.5 : 1 }">
            <b-col v-if="isLoading" class="justify-content-center d-flex">
                <b-spinner variant="light" />
            </b-col>
            <b-col v-else lg="4" xl="3" :key="key" v-for="(campaign, key) of campaigns.results">
                <BaseCardCampaign :campaign="campaign" @clicked="onClickCampaign" />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseCardCampaign from '../components/BaseCardCampaign.vue';
import BaseNavbarSecondary from '../components/BaseNavbarSecondary.vue';
import { API_URL } from '../config/secrets';
import imgJumbotron from '../assets/thx_token_governance.webp';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardCampaign,
        BaseNavbarSecondary,
    },
    data(): any {
        return {
            isLoadingSearch: false,
            isLoadingPage: false,
            isAlertShown: true,
            imgJumbotron,
            isLoading: false,
            page: 1,
            limit: 1,
            search: '',
            debouncedSearch: null,
            screenWidth: window.innerWidth,
            campaigns: { results: [], total: 0 },
        };
    },
    async mounted() {
        await this.getCampaigns();
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
        async getCampaigns() {
            const url = new URL(API_URL);
            url.pathname = '/v1/pools/public';
            url.searchParams.append('page', this.page);
            if (this.search) {
                url.searchParams.append('search', this.search);
            }
            const res = await fetch(url);
            const campaigns = await res.json();

            this.campaigns = campaigns;
        },
        onInputSearch() {
            this.isLoadingSearch = true;
            clearTimeout(this.debouncedSearch);
            this.debouncedSearch = setTimeout(async () => {
                await this.getCampaigns();
                this.isLoadingSearch = false;
            }, 1000);
        },
        onClickCampaign(campaignId: string) {
            this.isLoading = true;
            this.$router.push({ path: `/c/${campaignId}`, query: { origin: window.location.origin } });
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
</style>
