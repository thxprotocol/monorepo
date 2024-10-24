<template>
    <div ref="mainComponent" class="mainComponent">
        <div>
            <HeaderNav :is-visible="true" />
            <div v-if="selectedPart === 'Quests' || !accountStore.isMobile" class="bg-santa">
                <div class="bg-blur">
                    <div class="unwrap">UNWRAP</div>
                </div>
            </div>
            <div ref="secondDiv" class="d-flex window-container">
                <div class="d-flex w-100">
                    <Quests :selected-part="selectedPart" />

                    <BaseSidebar />
                    <div
                        v-if="accountStore.isMobile && (selectedPart === 'Leaderboard' || selectedPart === 'Wallet')"
                        class="w-100"
                        style="height: calc(100vh - 140px); position: relative; top: 70px"
                    >
                        <div v-if="selectedPart === 'Leaderboard'" class="leaderboard-cont">
                            <BaseQuestLeaderboardSmall :selected-part="selectedPart" />
                        </div>
                        <div v-if="selectedPart === 'Wallet'">
                            <BaseCardRewards />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BaseNavbarPrimary
            v-if="accountStore.isMobile"
            style="width: 100%; position: fixed; bottom: 0; z-index: 22"
            @nav-clicked="handleNavClick"
        />
        <BaseModalInvite :show="isModalInviteShown" />
    </div>
</template>

<script lang="ts">
import { API_URL, CP_CAMPAIGN, DASHBOARD_URL, PUBLIC_URL, SANTA_CAMPAIGN } from '../../config/secrets';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { mapStores } from 'pinia';
import { decodeHTML } from '../../utils/decode-html';
import imgLogo from '../../assets/logo.png';
import earningsIcon from '../../assets/earnings-logo.png';
import * as html from 'html-entities';
import { defineComponent } from 'vue';

const CACHE_EXPIRY = 1000 * 60 * 60 * 24 * 7;

export default defineComponent({
    name: 'Home',
    data(): any {
        return {
            decodeHTML,
            publicURL: PUBLIC_URL,
            dashboardURL: DASHBOARD_URL,
            questLists: [],
            isLoadingSearch: false,
            isLoadingPage: false,
            isAlertShown: true,
            imgLogo,
            isLoading: true,
            page: 1,
            limit: 20,
            search: '',
            debouncedSearch: null as any,
            screenWidth: window.innerWidth,
            campaigns: { results: [], total: 0 },
            isModalCampaignDomainShown: false,
            filteredCampaigns: [],
            brands: [],
            earningsIcon,
            currentIndex: 0,
            selectedPart: 'Quests',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
        isModalInviteShown(): boolean {
            return !!this.$route.params.code;
        },
    },
    watch: {
        async 'page'(page) {
            this.page = page;
            this.isLoadingPage = true;
            await this.getCampaigns();
            this.isLoadingPage = false;
        },
        'accountStore.isAuthenticated': {
            handler(isAuthenticated) {
                if (!isAuthenticated) return;
                this.getParticipants();
            },
            immediate: true,
        },
    },
    async mounted() {
        await this.getCampaigns();
        await this.getQuests();
        await this.getStoreLogos();
        this.isLoading = false;
        window.addEventListener('scroll', this.handleScroll);
        this.checkWidth();
        window.addEventListener('resize', this.checkWidth);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.checkWidth);
    },
    methods: {
        async getParticipants() {
            if (this.accountStore.isAuthenticated) {
                await this.accountStore.getParticipants();
                // console.log('participants: ', this.accountStore.participants);
            }
        },
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

            // this.campaigns = campaigns;
            // this.campaigns.results = this.campaigns.results.map((campaign: any) => ({
            //     ...campaign,
            //     title: html.decode(campaign.title),
            //     description: html.decode(campaign.description),
            // }));
            this.filteredCampaigns = campaigns.results.filter((campaign: any) =>
                [SANTA_CAMPAIGN, CP_CAMPAIGN].includes(campaign._id),
            );

            // Decode HTML entities
            this.filteredCampaigns = this.filteredCampaigns.map((campaign: any) => ({
                ...campaign,
                title: html.decode(campaign.title),
                description: html.decode(campaign.description),
            }));
        },
        async getQuests() {
            const url = new URL(API_URL);
            url.pathname = '/v1/quests/public';
            const res = await fetch(url);
            const questLists = await res.json();
            const combinedQuests = questLists.reduce((acc: any[], item: any) => {
                if (item.quests && Array.isArray(item.quests)) {
                    acc.push(...item.quests);
                }
                return acc;
            }, []);
            this.questLists = combinedQuests.slice(0, 5).map((quest: TBaseQuest) => ({
                ...quest,
                title: quest.title && html.decode(quest.title),
                description: quest.description && html.decode(quest.description),
            }));
        },
        async getStoreLogos() {
            const cachedData = localStorage.getItem('storeBrands');
            const cachedTime = localStorage.getItem('storeBrands_timestamp');
            const now = Date.now();

            if (cachedData && cachedTime && now - parseInt(cachedTime) < CACHE_EXPIRY) {
                const brands = JSON.parse(cachedData);
                this.brands = brands;
            } else {
                const res = await fetch('https://cbapi.santabrowser.com/home/stores');
                const data = await res.json();

                const brands = data.data[0].stores.map((store: any) => ({
                    name: store.name,
                    logo: store.logo,
                    cashback_amount: store.cashback_amount,
                }));
                localStorage.setItem('storeBrands', JSON.stringify(brands));
                localStorage.setItem('storeBrands_timestamp', now.toString());

                this.brands = this.shuffleArray(brands).slice(0, 8);
            }
        },
        shuffleArray(array: any[]) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        onInputSearch() {
            this.isLoadingSearch = true;
            clearTimeout(this.debouncedSearch);
            this.debouncedSearch = setTimeout(async () => {
                await this.getCampaigns();
                this.isLoadingSearch = false;
            }, 1000);
        },
        checkWidth() {
            this.accountStore.onResize();
        },
        handleNavClick(item: string) {
            this.selectedPart = item;
        },
    },
});
</script>

<style lang="scss" scoped>
.landing-page {
    display: block;
    //background-image: url('/src/assets/bg-mosaic.png');
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    transition: transform 0.5s ease;
    //height: 100vh;
    //padding: 12px;
}

.hidden {
    display: none !important;
}

.landing-top h1 {
    text-align: center;
    color: transparent;
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 61px;
    font-style: italic;
    font-weight: 600;
    text-shadow: 0px 20px 30px rgba(0, 0, 0, 0.6);
    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);

    background: radial-gradient(137.13% 253.39% at 76.68% 66.67%, #602ea6 0%, #c977d6 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    span {
        background: #fff;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 300;
    }
}

.landing-top p {
    color: rgba(255, 255, 255, 0.75);
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    text-align: center;
}
.window-container {
    //height: calc(100vh - 70px);
    //background-color: #0c0d15;
    //position: absolute;
    //bottom: -60%;
    //top: 10px;
    //left: 0;
    width: 100%;
    transition: bottom 0.5s ease-in-out;
    z-index: 11;
    //overflow: hidden;
}

.campaigns-box {
    padding: 20px;
    border-radius: 20px;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.37) 0%, rgba(0, 0, 0, 0.37) 100%),
        linear-gradient(0deg, rgba(0, 0, 0, 0.31) 0%, rgba(232, 232, 232, 0.08) 100%);
    border: 1.5px solid #5f03ff3f;
    box-shadow: drop-shadow(0px 4px 49px rgba(0, 0, 0, 0.38));
    backdrop-filter: blur(6.5px);
}
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
.trending-title {
    display: flex;
    flex-direction: column;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    background: linear-gradient(90deg, #fff 0%, #d7d7d7 26.5%, #dedede 55.5%, #fff 76.5%, #b4b1b1 88%, #999 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
}

.trending-grad {
    color: #f5f5f5;
    font-size: 30px;
    font-style: italic;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 28px;
}

.rare-quest-title {
    text-align: left;
    font-size: 30px;
    padding: 5px;
    text-transform: uppercase;
    font-weight: 800;
    line-height: 120%;
    background: linear-gradient(90deg, #fff 1.29%, #f3bcbc 99.94%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.containers {
    max-width: 98% !important;
    padding: 10px 28px;
}

.brand-logo {
    width: 110px;
    border-radius: 5px;
}

.earnings-link {
    font-size: 1.5rem;
    text-decoration: none;
    color: #fff !important;
    font-weight: 600;
    line-height: 1.25rem;
}

#left-sidebar {
    background-image: url('/src/assets/bg-mosaic.png');
    background-size: cover;
    background-repeat: no-repeat;
    padding: 0;
    margin: 0;
}

.bestoftheweb {
    font-family: 'Kode Mono', monospace;
    font-size: 3vw;
    /* color: #c53ded; */
    line-height: 5vh;
    /* font-weight: bold; */
    text-transform: uppercase;
    background: #000;
    margin-top: -29px;
    padding: 0 20px;
    border: 1px solid #ffcd06;
    border-radius: 36px;
    height: fit-content;
}
.bestofwrapper {
    height: 60vh;
    justify-content: center;
}

.mainComponent {
    background-size: cover;
    background-repeat: no-repeat;
    padding: 0;
    margin: 0;
    background-blend-mode: color-dodge;
    background-attachment: fixed;
    background: #000;
}

@media (max-width: 424px) {
    .campaigns-box {
        flex-direction: column;
        margin-top: 16px !important;
    }
    .carousel-cont {
        justify-content: start !important;
        margin-top: 32px !important;
    }
}

@media (max-width: 992px) {
    .window-container {
        //height: calc(100vh - 70px);
        padding-bottom: 70px;
    }
    .unwrap {
        line-height: 28vh;
    }
    .leaderboard-cont {
        height: 100%;
        padding: 12px 12px 0;
    }
}
</style>
