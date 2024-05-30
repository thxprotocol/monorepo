<template>
    <BaseCardHeaderHome />
    <b-container>
        <b-row class="mt-5 mb-3">
            <b-col xs="12" md="6">
                <h2>Explore Campaigns</h2>
            </b-col>
            <b-col xs="12" md="4" offset-md="2" class="d-flex align-items-center justify-content-end">
                <b-input-group class="mb-3 mb-md-0">
                    <template #prepend>
                        <b-input-group-text class="bg-primary">
                            <b-spinner v-if="isLoadingSearch" small variant="white" />
                            <i v-else class="fas fa-search"></i>
                        </b-input-group-text>
                    </template>
                    <b-form-input v-model="search" placeholder="Search..." @input="onInputSearch" />
                </b-input-group>
            </b-col>
        </b-row>
        <b-row :style="{ opacity: isLoadingSearch || isLoadingPage ? 0.5 : 1 }">
            <b-col>
                <div v-if="isLoading" class="justify-content-center d-flex">
                    <b-spinner small variant="primary" />
                </div>
                <p v-if="!isLoading && !campaigns.results.length" class="text-opaque">
                    Could not find a campaign with that name...
                </p>
                <BaseCardCampaign v-for="campaign of campaigns.results" class="mt-3" :campaign="campaign" />
            </b-col>
        </b-row>
        <b-pagination
            v-model="page"
            :per-page="limit"
            :total-rows="campaigns.total"
            align="center"
            class="mt-3 mb-0"
        ></b-pagination>
    </b-container>
    <b-container class="mb-5">
        <b-row class="mt-5 mb-3">
            <b-col xs="12" md="6">
                <h2>Quest Spotlight</h2>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-for="quest of questLists" lg="3" :quest="quest">
                <BaseCardQuestSpotlight :quest="quest" class="mb-2" />
            </b-col>
        </b-row>
    </b-container>
    <BaseCardHeader row-class="py-md-0" class="my-5">
        <template #primary>
            <b-img :src="imgHeader" fluid />
        </template>
        <template #secondary>
            <div class="py-lg-5 pe-lg-5">
                <h1 class="mt-lg-3">
                    Quest<br />
                    Campaigns
                </h1>
                <p class="lead mb-4">
                    Give back to your community while increasing engagement with effective Quest Campaigns.
                </p>
                <b-button :href="`${publicURL}/pricing`" variant="primary" class="me-3 px-5" target="_blank">
                    Campaign Pricing
                </b-button>
                <b-button
                    href="https://discord.com/invite/TzbbSmkE7Y"
                    target="_blank"
                    variant="link"
                    class="text-white"
                >
                    Reach out! We don't bite😉
                </b-button>
            </div>
        </template>
    </BaseCardHeader>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { API_URL, DASHBOARD_URL, PUBLIC_URL } from '../../config/secrets';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { mapStores } from 'pinia';
import { decodeHTML } from '../../utils/decode-html';
import imgJumbotron from '../../assets/thx_token_governance.png';
import imgLogo from '../../assets/logo.png';
import imgHeader from '../../assets/thx_token_governance.png';
import * as html from 'html-entities';

export default defineComponent({
    name: 'Home',
    data(): any {
        return {
            imgHeader,
            decodeHTML,
            publicURL: PUBLIC_URL,
            dashboardURL: DASHBOARD_URL,
            questLists: { daily: [], invite: [], social: [], custom: [], web3: [], gitcoin: [] },
            isLoadingSearch: false,
            isLoadingPage: false,
            isAlertShown: true,
            imgJumbotron,
            imgLogo,
            isLoading: true,
            page: 1,
            limit: 15,
            search: '',
            debouncedSearch: null as any,
            screenWidth: window.innerWidth,
            campaigns: { results: [], total: 0 },
            isModalCampaignDomainShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
    },
    watch: {
        async page(page) {
            this.page = page;
            this.isLoadingPage = true;
            await this.getCampaigns();
            this.isLoadingPage = false;
        },
    },
    async mounted() {
        await this.getCampaigns();
        await this.getQuests();
        this.isLoading = false;
    },
    methods: {
        async getCampaigns() {
            const url = new URL(API_URL);
            url.pathname = '/v1/leaderboards';
            url.searchParams.append('page', this.page.toString());
            url.searchParams.append('limit', this.limit.toString());
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

            this.questLists = questLists.map((quest: TBaseQuest) => ({
                ...quest,
                title: html.decode(quest.title),
                description: html.decode(quest.description),
            }));
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

<style lang="scss">
.pagination {
    --bs-pagination-focus-bg: var(--bs-purple-dark);
    --bs-pagination-focus-color: rgba(255, 255, 255, 0.5);
    --bs-pagination-focus-border-color: var(--bs-purple-dark);

    --bs-pagination-hover-color: white;
    --bs-pagination-hover-bg: var(--bs-purple);
    --bs-pagination-hover-border-color: var(--bs-purple);

    --bs-pagination-color: rgba(255, 255, 255, 0.5);
    --bs-pagination-bg: #37277b;
    --bs-pagination-border-color: #37277b;

    --bs-pagination-disabled-color: rgba(255, 255, 255, 0.25);
    --bs-pagination-disabled-bg: #37277b;
    --bs-pagination-disabled-border-color: #37277b;
}
.form-control {
    border-color: var(--bs-primary);
}
.nav-pills .nav-link {
    text-transform: capitalize;
    color: rgba(255, 255, 255, 0.5);
}
#table-campaigns th:nth-child(1) {
    width: 50px;
}
#table-campaigns th:nth-child(2) {
    width: 120px;
}
#table-campaigns td:nth-child(2) {
    padding: 0px !important;
    text-align: center;
}
#table-campaigns th:nth-child(3) {
    width: auto;
}
#table-campaigns th:nth-child(4) {
    width: 150px;
}
#table-campaigns th:nth-child(5) {
    width: 120px;
}
#table-campaigns th:nth-child(6) {
    width: 100px;
}
#table-campaigns th:nth-child(7) {
    width: 100px;
}
#table-campaigns tr td {
    cursor: pointer;
}
.carousel-inner > div > img,
.carousel-inner > img {
    display: none !important;
}

.carousel-caption {
    position: relative;
    right: 0;
    left: 0;
    bottom: auto;
    padding: 0;
    text-align: left;
}

.carousel-indicators {
    position: absolute;
    top: 0;
    bottom: auto;
    margin: 0;
    margin-top: -2rem;
    justify-content: flex-end;
    width: auto;

    [data-bs-target] {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
}
</style>
