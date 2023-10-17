<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>Earn THX</h1>
                    <p class="lead mb-4">Earn additional rewards by investing in Balancer liquidity pools.</p>
                    <b-button @click="onClickStart" variant="primary" class="me-3 px-5">
                        Claim
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button :href="publicUrl" target="_blank" variant="link" class="text-white">
                        Learn more
                    </b-button>
                </div>
            </b-col>
            <b-col lg="5" class="py-4 py-lg-0 offset-lg-3 text-right">
                <b-card class="p-1">
                    <BTable
                        class="mb-0"
                        responsive="lg"
                        show-empty
                        :items="[
                            { Token: 'THX Network (POS)', MyBalance: '1000 THX', Action: 'Invest' },
                            { Token: 'THX Network (VE)', MyBalance: '2000 veTHX', Action: 'Stake' },
                        ]"
                    >
                        <template #head(Action)="{ item }"></template>
                        <template #cell(Action)="{ item }">
                            <b-button size="sm" class="w-100" variant="primary">{{ item['Action'] }}</b-button>
                        </template>
                    </BTable>
                </b-card>
            </b-col>
        </b-row>
        <h2>Investments</h2>
        <BTable
            responsive="lg"
            show-empty
            :items="[
                {
                    Composition: 'Balancer THX/USD',
                    APR: '16.27%-37.94%',
                    MyValue: '$930,12',
                    PoolValue: '$2830,12',
                    More: 'https://app.balancer.fi/#/polygon/pool/0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66',
                },
            ]"
        >
            <template #cell(Composition)="{ item }">
                <b-img
                    width="23"
                    class="rounded-circle"
                    src="https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015.png"
                />
                <b-img
                    width="23"
                    class="rounded-circle"
                    src="https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4.png"
                />
                <b-badge class="p-2 ms-2" variant="success">THX <small>80%</small></b-badge>
                <b-badge class="p-2" variant="link">USD <small>20%</small></b-badge>
            </template>
            <template #cell(APR)="{ item }"> {{ item.APR }} ✨ </template>
            <template #head(More)="{ item }"></template>
            <template #cell(More)="{ item }">
                <b-button variant="primary" size="sm" :href="item.More" target="_blank">View Pool</b-button>
            </template>
        </BTable>
        <h2 class="mt-5">Rewards</h2>
        <BTable
            responsive="lg"
            show-empty
            :items="[
                {
                    Token: {
                        image: 'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015.png',
                        name: 'THX Network (POS)',
                    },
                    Amount: '768.231 THX',
                    Value: '$32.22',
                    Action: 'Claim',
                },
                {
                    Token: {
                        image: 'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
                        name: 'Balancer (POS)',
                    },
                    Amount: '35.203 BAL',
                    Value: '$12.22',
                    Action: 'Claim',
                },
            ]"
        >
            <template #cell(Token)="{ item }">
                <b-img width="23" class="rounded-circle me-2" :src="item.Token.image" />
                {{ item.Token.name }}
            </template>
            <template #head(Action)="{ item }"></template>
            <template #cell(Action)="{ item }">
                <b-button variant="primary" size="sm">{{ item.Action }}</b-button>
            </template>
        </BTable>
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
            publicUrl: 'https://www.thx.network',
            questLists: { daily: [], invite: [], social: [], custom: [], web3: [] },
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
        },
    },
    methods: {
        onClickStart() {
            window.open('https://dashboard.thx.network', '_blank');
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
            url.pathname = '/v1/rewards/public';
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
        onClickCampaign(campaignId: string) {
            this.isLoading = true;
            this.$router.push({ path: `/c/${campaignId}`, query: { origin: window.location.origin } });
        },
    },
});
</script>

<style>
.table {
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
</style>
