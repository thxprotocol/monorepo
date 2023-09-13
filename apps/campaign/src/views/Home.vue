<template>
    <div>
        <b-container>
            <b-row class="py-md-5">
                <b-col lg="4" class="text-white brand-intro order-1 order-md-0 align-items-center d-flex">
                    <div>
                        <h1 class="mb-3">
                            Campaign<br />
                            Discovery
                        </h1>
                        <p class="lead mb-4">
                            A single spot to discover all Quest &amp; Reward campaigns that you can participate in.
                        </p>
                    </div>
                </b-col>
                <b-col lg="5" class="order-0 order-md-1 offset-lg-3 text-right">
                    <b-card class="p-1">
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
                    @change="onChangePage"
                    v-model="page"
                    :per-page="25"
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
import { API_URL } from '../config/secrets';
import imgJumbotron from '../assets/thx_token_governance.webp';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardCampaign,
    },
    data(): any {
        return {
            isLoadingSearch: false,
            isLoadingPage: false,
            isAlertShown: true,
            imgJumbotron,
            isLoading: false,
            page: 1,
            search: '',
            debouncedSearch: null,
            campaigns: { results: [], total: 0 },
        };
    },
    async mounted() {
        await this.getCampaigns();
        this.isLoading = false;
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
        async onChangePage() {
            this.isLoadingPage = true;
            await this.getCampaigns();
            this.isLoadingPage = false;
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
    --bs-pagination-border-color: #37277b;
    --bs-pagination-disabled-border-color: #37277b;

    --bs-pagination-bg: #37277b;
    --bs-pagination-disabled-bg: #37277b;
}
.form-control {
    border-color: var(--bs-primary);
}
</style>
