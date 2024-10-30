<template>
    <div
        v-if="selectedPart === 'leaderboard'"
        header-class="p-0"
        body-class="d-flex flex-column pt-0"
        class="leaderboard-wrapper mt-4"
    >
        <b-card-title class="d-flex m-0 align-items-center">
            <!-- <div class="d-flex align-items-center justify-content-center" style=""> -->
            <!-- <i class="fa fa-trophy me-2 text-opaque" /> -->
            <!-- <img :src="trophyImage" alt="trophy" loading="lazy" width="17" height="17" class="me-2" /> -->
            <!-- </div> -->
            <div class="flex-grow-1 pe-2">
                <h3 class="leaderboard-title">Leaderboard</h3>
                <span
                    class="d-block flex-grow-1 pe-2 fa-xs mt-2"
                    style="color: #fff; opacity: 0.6; font-family: Poppins"
                >
                    (Monthly)
                </span>
            </div>
            <!-- <b-button class="text-primary refresh-color" variant="link" @click="onClickRefresh">
                <b-spinner v-if="isLoading" small />
                <i v-else class="fas fa-sync-alt" />
            </b-button> -->
        </b-card-title>
        <b-list-group v-if="isLoading" class="skeleton-loader my-list">
            <div v-for="n in 10" :key="n" class="skeleton-item d-flex p-1 align-items-center">
                <div class="skeleton-rank">{{ n }}</div>
                <div class="skeleton-avatar"></div>
                <div class="skeleton-username"></div>
            </div>
        </b-list-group>
        <b-list-group v-else class="my-list d-flex flex-column">
            <b-list-group-item
                v-for="(entry, key) of accountStore.leaderboardPrimary"
                :key="key"
                class="d-flex px-0 pe-3 align-items-center"
            >
                <span class="list-item-field-rank">{{ entry.rank }}</span>
                <span class="list-item-field-address flex-grow-1 ps-2 d-flex align-items-center">
                    <b-avatar
                        size="md"
                        variant="primary"
                        :src="entry.account.profileImg"
                        :alt="`Profile picture of ${entry.account.username}`"
                        class="me-1"
                    />
                    <span class="username-text" :title="entry.account.username">{{ entry.account.username }}</span>
                </span>
                <div class="list-item-field-questcount flex-grow-1 text-opaque pe-3">
                    <span>{{ entry.questEntryCount }}</span>
                    <i class="fas fa-tasks ms-1" />
                </div>
                <strong class="list-item-field-score">{{ formatScore(entry.score) }}</strong>
            </b-list-group-item>
        </b-list-group>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useQuestStore } from '../stores/Quest';
import { SANTA_CAMPAIGN, CP_CAMPAIGN } from '../config/secrets';
import trophyImage from '../assets/trophy.png';
export default defineComponent({
    name: 'BaseQuestLeaderboardSmall',
    props: {
        selectedPart: {
            type: String,
            default: 'Quests',
        },
    },
    data() {
        return {
            isLoading: false,
            trophyImage,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
    },
    watch: {
        // '$route'(to, from) {
        //     this.updateLeaderboard();
        // },
        // 'accountStore.participants': {
        //     handler(newVal) {
        //         this.updateLeaderboard();
        //     },
        //     immediate: true,
        // },
    },
    mounted() {
        this.updateLeaderboard();
    },
    methods: {
        async updateLeaderboard() {
            // const url = window.location.href;
            // const poolIdMatch = url.match(/\/c\/([a-f0-9]{24})\//);
            if (this.isLoading) return;
            this.isLoading = true;
            await this.accountStore.getLeaderboard(SANTA_CAMPAIGN);
            this.isLoading = false;
            // if (poolIdMatch) {
            //     await this.accountStore.getLeaderboard(poolIdMatch[1]);
            // } else {
            //     await this.accountStore.getLeaderboard(SANTA_CAMPAIGN);
            // }
        },
        // async onClickRefresh() {
        //     this.isLoading = true;
        //     await this.accountStore.getLeaderboard(SANTA_CAMPAIGN);
        //     this.isLoading = false;
        // },
        formatScore(score: number) {
            if (this.accountStore.poolId === CP_CAMPAIGN) {
                const dollars = score / 100;
                return `$${dollars.toFixed(dollars % 1 === 0 ? 0 : 2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
            }
            return score.toLocaleString();
        },
    },
});
</script>
<style lang="scss" scoped>
.card-header {
    border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);
}
.list-group-item {
    position: relative;
    padding-left: 40px !important;
}
.list-item-field-rank {
    position: absolute;
    top: 1px;
    left: 1px;
    bottom: 1px;
    width: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d4d4d4;
    font-family: Poppins;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.list-item-field-user {
    flex-grow: 1;
    display: flex;
    align-items: center;
}
.list-item-field-questcount {
    display: flex;
    align-items: center;
    //text-align: right;
    white-space: nowrap;
    color: #d4d4d4;
    font-family: Poppins;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 21px;
}
.list-item-field-questcount span {
    width: 20px;
}
.list-item-field-questcount i {
    color: #888888;
}
.list-item-field-score {
    width: 50px;
    text-align: right;
    color: #d4d4d4;
    font-family: Poppins;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 175%;
    letter-spacing: 0.48px;
}
.refresh-color {
    --bs-primary-rgb: #515151 !important;
}
.leaderboard-wrapper {
    background: transparent;
    width: 800px;
}

.my-list .list-group-item {
    border: none;
    border-radius: 0;
    &:nth-child(odd) {
        background-color: #202020;
    }
    &:nth-child(even) {
        background-color: transparent;
    }
}

.username-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 300px;
    color: #d4d4d4;
    font-family: Poppins;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    padding-left: 16px;
}

.leaderboard-wrapper .card-title {
    padding-left: 20px;
    padding-bottom: 18px;
}

.leaderboard-wrapper .list-group {
    padding: 13.5px 20px;
}
.skeleton-loader {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.skeleton-item {
    &:nth-child(odd) {
        background-color: #202020;
    }
    &:nth-child(even) {
        background-color: transparent;
    }
}

.skeleton-avatar,
.skeleton-username {
    background-color: #c0c0c0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

.skeleton-rank {
    width: 30px;
    text-align: center;
    color: #d4d4d4;
    font-family: Poppins;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}

.skeleton-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin: 0 10px;
}

.skeleton-username {
    flex-grow: 1;
    height: 20px;
}

.leaderboard-title {
    color: #d4d4d4;
    font-feature-settings: 'liga' off, 'clig' off;
    text-shadow: 0px 1px 9px rgba(255, 255, 255, 0.3);
    font-family: Poppins;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}

@media (max-width: 992px) {
    .leaderboard-wrapper {
        height: 100%;
        margin: 0;
        width: 100%;
    }
    .my-list {
        max-height: calc(100vh - 220px);
    }
    .username-text {
        width: 100px;
    }
}
//@media (max-height: 894px) {
//.my-list {
//    max-height: 200px;
//  }
//}
</style>
