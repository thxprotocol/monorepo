<template>
    <b-container v-if="selectedPart === 'quests' || selectedPart === 'rewards'" class="quest-cont">
        <b-row>
            <b-col
                v-if="selectedPart === 'quests'"
                lg="6"
                xl="7"
                offset-xl="0"
                class="quests-column flex-grow-1 my-col-xl-7 p-3 pt-2"
            >
                <!-- <div class="mb-2 align-items-center bg-quests rounded">
                    <div class="quests-title d-flex p-2">
                        <div>
                            <strong class="title-q">Quests</strong>
                            <div class="text-opaque m-0 mt-1">Earn points with tasks</div>
                        </div>
                        <i class="fas fa-tasks text-opaque ms-auto me-3" style="font-size: 1.2rem" />
                    </div>
                </div> -->

                <b-tabs justified>
                    <b-tab active>
                        <template #title>
                            Available
                            <!-- <sup v-if="availableQuestCount">
                                <b-badge class="px-1 py-1 text-white" variant="danger" style="font-size: 8px">
                                    {{ availableQuestCount }}
                                </b-badge>
                            </sup> -->
                        </template>
                        <div class="quests-box">
                            <div
                                v-if="questStore.isLoading || isLoadingOffers"
                                class="d-flex justify-content-center p-3"
                            >
                                <div class="w-100 quest-skeleton-group">
                                    <div v-for="n in 8" :key="n" class="quest-skeleton-loader mb-3">
                                        <div class="skeleton-image"></div>
                                        <div class="skeleton-title"></div>
                                        <div class="skeleton-description"></div>
                                        <div class="skeleton-button"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="d-flex flex-column">
                                <div v-for="group in mergedQuestsAndOffers" :key="group.title">
                                    <div
                                        v-if="!group.isOfferRow"
                                        :class="{
                                        'd-none': group.quests.every((quest: TBaseQuest) => {
                                            if (quest.variant === 0) {
                                                return quest.isCompleted;
                                            } else {
                                                return !quest.isAvailable;
                                            }
                                        }), 
                                        }"
                                        class="mt-4"
                                    >
                                        <h3 class="quest-group-title">{{ group.title }}</h3>
                                        <div class="quest-group">
                                            <div
                                                v-for="quest in group.quests"
                                                :key="quest._id"
                                                :class="{
                                                    'd-none':
                                                        quest.variant === 0 ? quest.isCompleted : !quest.isAvailable,
                                                    'quest-item': true,
                                                    'quest-item-daily': quest.variant === 0,
                                                }"
                                                class="quest-group-item"
                                            >
                                                <component
                                                    :is="questComponentMap[quest.variant]"
                                                    :quest="quest"
                                                    :group-title="group.title"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="offers-box mt-4">
                                        <h3 class="quest-group-title">{{ group.title }}</h3>
                                        <div class="d-flex flex-wrap offer-row">
                                            <div
                                                v-for="offer in group.offers"
                                                :key="offer.id"
                                                class="offer-item"
                                                :style="{
                                                    width:
                                                        group.offers.length === 1
                                                            ? '100%'
                                                            : `calc((100% - (${
                                                                  offersPerRow - 1
                                                              } * 1%)) / ${offersPerRow})`,
                                                    maxWidth:
                                                        group.offers.length === 1
                                                            ? '100%'
                                                            : `calc((100% - (${
                                                                  offersPerRow - 1
                                                              } * 1%)) / ${offersPerRow})`,
                                                }"
                                            >
                                                <OfferCard :offer="offer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- <div
                                v-for="(item, index) in mergedQuestsAndOffers"
                                :key="index"
                                :class="{
                                    'w-100': item.isDaily || item.isOfferRow || item.isAlone,
                                    'regular-quest': !item.isDaily && !item.isOfferRow && !item.isAlone,
                                    'd-none': item.quest?.isAvailable === false,
                                }"
                            >
                                <div v-if="item.isOfferRow" class="offers-box">
                                    <h3>Top performing offers</h3>
                                    <div class="d-flex flex-wrap offer-row">
                                        <div
                                            v-for="offer in item.offers"
                                            :key="offer.id"
                                            class="offer-item"
                                            :style="{
                                                width:
                                                    item.offers.length === 1
                                                        ? '100%'
                                                        : offersPerRow === 3
                                                        ? '30%'
                                                        : '49%',
                                                maxWidth:
                                                    item.offers.length === 1
                                                        ? '100%'
                                                        : offersPerRow === 3
                                                        ? '30%'
                                                        : '49%',
                                            }"
                                        >
                                            <OfferCard :offer="offer" class="mb-2" />
                                        </div>
                                    </div>
                                </div> -->
                                <!-- <div v-else :class="{ 'd-none': !item.quest?.isAvailable }"> -->
                                <!-- <component :is="questComponentMap[item.quest.variant]" v-else :quest="item.quest" /> -->
                                <!-- </div> -->
                                <!-- </div> -->
                                <div v-if="!availableQuestCount" class="text-center mt-5">
                                    <i class="h1 fas fa-trophy text-accent" />
                                    <p class="lead text-accent">Well done!</p>
                                    <p class="text-opaque">You have completed all available quests</p>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                    <!-- <b-tab title="Completed">
                        <div v-for="(quest, key) of quests" :key="key" :class="{ 'd-none': quest.isAvailable }">
                            <component
                                :is="questComponentMap[quest.variant]"
                                :quest="quest"
                                class="mb-2 mx-lg-0 my-lg-3"
                                :available-quest="!quest?.isAvailable"
                            />
                        </div>
                    </b-tab> -->
                    <b-tab title="Completed">
                        <div class="quests-box">
                            <div v-if="questStore.isLoading" class="d-flex justify-content-center p-3">
                                <div class="w-100 quest-skeleton-group">
                                    <div v-for="n in 8" :key="n" class="quest-skeleton-loader mb-3">
                                        <div class="skeleton-image"></div>
                                        <div class="skeleton-title"></div>
                                        <div class="skeleton-description"></div>
                                        <div class="skeleton-button"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="d-flex flex-column">
                                <div
                                    v-for="group in filteredCompletedQuests"
                                    :key="group.title"
                                    :class="{
                                    'd-none': group.quests && group.quests.every((quest: TBaseQuest) => {
                                        if (quest.variant === 0) {
                                            return !quest.isCompleted;
                                        } else {
                                            return quest.isAvailable;
                                        }
                                    }) && !group.isOfferRow,
                                    }"
                                    class="mt-4"
                                >
                                    <h3 class="quest-group-title">{{ group.title }}</h3>
                                    <div class="quest-group">
                                        <div
                                            v-for="quest in group.quests"
                                            :key="quest._id"
                                            :class="{
                                                'd-none': quest.isAvailable === true,
                                                'quest-item': true,
                                                'quest-item-daily': quest.variant === 0,
                                            }"
                                            class="quest-group-item"
                                        >
                                            <component :is="questComponentMap[quest.variant]" :quest="quest" />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-if="
                                        filteredCompletedQuests.length === 0 ||
                                        filteredCompletedQuests.every((group) =>
                                            group.quests.every((quest) => quest.isAvailable),
                                        )
                                    "
                                    class="empty-message"
                                >
                                    <p class="text-center text-muted mt-3 text-opaque">
                                        You haven't completed any quests yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </b-tab>

                    <b-tab title="About">
                        <div class="quests-box d-flex justify-content-center align-items-center">
                            <p class="text-center text-muted mt-3 text-opaque empty-message">
                                No information available.
                            </p>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-col>
            <b-col
                v-if="selectedPart === 'rewards'"
                lg="5"
                xl="5"
                xxl="4"
                class="quests-column flex-grow-1 pt-2 px-3"
                offset-xl="0"
            >
                <b-tabs content-class="mt-3" justified class="mt-3">
                    <b-tab active>
                        <template #title> Available </template>
                        <div class="quests-box">
                            <div
                                v-if="rewardStore.isLoading || reward2Store.isLoading"
                                class="d-flex justify-content-center p-3"
                            >
                                <div class="w-100 quest-skeleton-group">
                                    <div v-for="n in 8" :key="n" class="quest-skeleton-loader mb-3">
                                        <div class="skeleton-image"></div>
                                        <div class="skeleton-title"></div>
                                        <div class="skeleton-description"></div>
                                        <div class="skeleton-button"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="reward-group">
                                <div
                                    v-for="reward in mergedRewards.filter((reward) => reward.isAvailable)"
                                    :key="reward._id"
                                    :class="{ 'reward-item-promoted': reward.isPromoted }"
                                    class="reward-item"
                                >
                                    <component :is="componentMap[reward.variant]" :reward="reward" />
                                </div>
                            </div>
                        </div>
                    </b-tab>
                    <b-tab title="Completed">
                        <div class="quests-box">
                            <div
                                v-if="rewardStore.isLoading || reward2Store.isLoading"
                                class="d-flex justify-content-center p-3"
                            >
                                <div class="w-100 quest-skeleton-group">
                                    <div v-for="n in 8" :key="n" class="quest-skeleton-loader mb-3">
                                        <div class="skeleton-image"></div>
                                        <div class="skeleton-title"></div>
                                        <div class="skeleton-description"></div>
                                        <div class="skeleton-button"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="reward-group">
                                <div
                                    v-for="reward in mergedRewards.filter((reward) => !reward.isAvailable)"
                                    :key="reward._id"
                                    :class="{ 'reward-item-promoted': reward.isPromoted }"
                                    class="reward-item"
                                >
                                    <component :is="componentMap[reward.variant]" :reward="reward" />
                                </div>
                                <div v-if="!mergedRewards.some((reward) => !reward.isAvailable)" class="empty-message">
                                    <p class="text-center text-muted mt-3 text-opaque">
                                        You haven't completed any rewards yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { useQuestStore } from '@thxnetwork/app/stores/Quest';
import { useRewardStore } from '@thxnetwork/app/stores/Reward';
import { useReward2Store } from '@thxnetwork/app/stores/Reward';
import { QuestVariant, RewardSortVariant } from '@thxnetwork/app/types/enums/rewards';
import { questComponentMap, sortMap } from '@thxnetwork/app/utils/quests';
import BaseCardQuestInvite from '@thxnetwork/app/components/card/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '@thxnetwork/app/components/card/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '@thxnetwork/app/components/card/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '@thxnetwork/app/components/card/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '@thxnetwork/app/components/card/BaseCardQuestWeb3.vue';
import BaseCardQuestGitcoin from '@thxnetwork/app/components/card/BaseCardQuestGitcoin.vue';
import BaseCardQuestWebhook from '@thxnetwork/app/components/card/BaseCardQuestWebhook.vue';
import { RewardVariant } from '@thxnetwork/app/types/enums/rewards';
import BaseCardRewardCoin from '@thxnetwork/app/components/card/BaseCardRewardCoin.vue';
import BaseCardRewardNFT from '@thxnetwork/app/components/card/BaseCardRewardNFT.vue';
import BaseCardRewardCustom from '@thxnetwork/app/components/card/BaseCardRewardCustom.vue';
import BaseCardRewardCoupon from '@thxnetwork/app/components/card/BaseCardRewardCoupon.vue';
import BaseCardRewardDiscordRole from '@thxnetwork/app/components/card/BaseCardRewardDiscordRole.vue';
import { CP_CAMPAIGN, SANTA_CAMPAIGN } from '@thxnetwork/app/config/secrets';
import { ref } from 'vue';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import axios from 'axios';
import OfferCard from '@thxnetwork/app/components/OfferCard.vue';

const selectedValue = ref<string>('All');
const componentMap: { [variant: string]: string } = {
    [RewardVariant.Coin]: 'BaseCardRewardCoin',
    [RewardVariant.NFT]: 'BaseCardRewardNFT',
    [RewardVariant.Custom]: 'BaseCardRewardCustom',
    [RewardVariant.Coupon]: 'BaseCardRewardCoupon',
    [RewardVariant.DiscordRole]: 'BaseCardRewardDiscordRole',
};

export default defineComponent({
    name: 'Quests',
    components: {
        BaseCardQuestInvite,
        BaseCardQuestSocial,
        BaseCardQuestCustom,
        BaseCardQuestDaily,
        BaseCardQuestWeb3,
        BaseCardQuestGitcoin,
        BaseCardQuestWebhook,
        BaseCardRewardCoin,
        BaseCardRewardNFT,
        BaseCardRewardCustom,
        BaseCardRewardCoupon,
        BaseCardRewardDiscordRole,
        OfferCard,
    },
    props: {
        selectedPart: {
            type: String,
            default: 'Quests',
        },
        isSecondDivVisible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            selectedValue,
            componentMap,
            questComponentMap,
            isLgScreen: window.innerWidth > 1000,
            selectedSort: { label: 'Default', key: RewardSortVariant.Default },
            activeFilters: [],
            entry: null,
            offers: [],
            offersPerRow: 5,
            isLoadingOffers: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        ...mapStores(useReward2Store),
        ...mapStores(useWalletStore),
        isSubscribed() {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
        isAlertSubscribeShown() {
            return !this.availableQuestCount;
        },
        availableQuestCount() {
            return this.questStore.quests.filter((q: TBaseQuest) => q.isAvailable).length;
        },
        quests() {
            const { quests } = this.questStore;
            console.log('Quests: ', quests);
            return quests
                .sort(sortMap[this.selectedSort.key])
                .map((quest: any, index: number) => ({ ...quest, index }));
        },
        mergedRewards() {
            console.log('rewards: ', this.rewardStore.rewards, this.reward2Store.rewards);
            if (this.selectedValue === 'All') {
                return [...this.rewardStore.rewards, ...this.reward2Store.rewards];
            } else if (this.selectedValue === 'Santa') {
                return this.reward2Store.rewards;
            } else if (this.selectedValue === 'Cash Rewards') {
                return this.rewardStore.rewards;
            }
            return [];
        },
        userManager() {
            return useAuthStore().userManager;
        },
        // mergedQuestsAndOffers() {
        //     let merged = [];
        //     let offerIndex = 0;
        //     const questBatchSize = 4;
        //     let rowQuests = [];

        //     for (let i = 0; i < this.quests.length; i++) {
        //         const quest = this.quests[i];
        //         const isEndOfBatch = (i + 1) % questBatchSize === 0;

        //         if (quest.variant === QuestVariant.Daily) {
        //             merged.push({ quest, isDaily: true });
        //             continue;
        //         }

        //         rowQuests.push(quest);

        //         if (isEndOfBatch) {
        //             merged.push(...this.formatQuests(rowQuests));
        //             rowQuests = [];
        //             merged.push({
        //                 isOfferRow: true,
        //                 offers: this.offers.slice(offerIndex, offerIndex + this.offersPerRow).filter(Boolean),
        //             });
        //             offerIndex += this.offersPerRow;
        //         }
        //     }

        //     if (rowQuests.length > 0) {
        //         merged.push(...this.formatQuests(rowQuests));
        //     }

        //     while (offerIndex < this.offers.length) {
        //         merged.push({
        //             isOfferRow: true,
        //             offers: this.offers.slice(offerIndex, offerIndex + this.offersPerRow).filter(Boolean),
        //         });
        //         offerIndex += this.offersPerRow;
        //     }

        //     return merged;
        // },
        mergedQuestsAndOffers() {
            const santaQuests: TBaseQuest[] = [];
            const xQuests: TBaseQuest[] = [];
            const discordQuests: TBaseQuest[] = [];
            const youtubeQuests: TBaseQuest[] = [];
            const otherQuests: TBaseQuest[] = [];

            this.quests.forEach((quest: TBaseQuest) => {
                switch (quest.variant) {
                    case QuestVariant.Daily:
                    case QuestVariant.Invite:
                    case QuestVariant.Custom:
                    case QuestVariant.Web3:
                    case QuestVariant.Gitcoin:
                    case QuestVariant.Webhook:
                        santaQuests.push(quest);
                        break;
                    case QuestVariant.Twitter:
                        xQuests.push(quest);
                        break;
                    case QuestVariant.Discord:
                        discordQuests.push(quest);
                        break;
                    case QuestVariant.YouTube:
                        youtubeQuests.push(quest);
                        break;
                    default:
                        otherQuests.push(quest);
                }
            });

            const groupedQuests = [
                { title: "Santa's Quests", quests: santaQuests },
                { title: 'X Quests', quests: xQuests },
                { title: 'Discord Quests', quests: discordQuests },
                { title: 'YouTube Quests', quests: youtubeQuests },
                { title: 'Other Quests', quests: otherQuests },
            ];

            const merged = [];
            let offerIndex = 0;

            groupedQuests.forEach((group) => {
                if (group.quests.length) {
                    merged.push(group);

                    if (offerIndex < this.offers.length) {
                        const offersForGroup = this.offers.slice(offerIndex, offerIndex + this.offersPerRow);
                        merged.push({
                            title: 'Top Performing Offers',
                            isOfferRow: true,
                            offers: offersForGroup,
                        });
                        offerIndex += this.offersPerRow;
                    }
                }
            });

            if (offerIndex < this.offers.length) {
                const remainingOffers = this.offers.slice(offerIndex);
                merged.push({
                    title: '',
                    isOfferRow: true,
                    offers: remainingOffers,
                });
            }
            return merged;
        },
        filteredCompletedQuests() {
            return this.mergedQuestsAndOffers.filter((group) => !group.isOfferRow);
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            async handler(isAuthenticated: boolean) {
                if (!isAuthenticated) return;
                if (!this.accountStore.account) {
                    await this.accountStore.getAccount();
                    this.fetchOffers();
                }

                await Promise.all([
                    this.questStore.list(SANTA_CAMPAIGN),
                    this.rewardStore.list(CP_CAMPAIGN),
                    this.reward2Store.list(SANTA_CAMPAIGN),
                ]);
            },
            immediate: true,
        },
        'availableQuestCount': {
            handler(amount: number) {
                // Return if not in iframe
                if (window.top === window.self) return;
                // Send the amount of unclaimed rewards to the parent window and update the launcher
                window.top?.postMessage({ message: 'thx.reward.amount', amount }, this.accountStore.config.origin);
            },
            immediate: true,
        },
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        async fetchOffers() {
            this.isLoadingOffers = true;
            try {
                const clid = this.accountStore.account?.providerUserId;
                const response = await axios.get(
                    `https://offers-api.santabrowser.com/offers/list?pageSize=15&pageNo=0&clid=${clid}`,
                );
                this.offers = response.data.trending
                    .filter(
                        (offer: any) =>
                            offer.imageUrl !== 'https://banners.hangmyads.com/files/uploads/Off_A_86634.png',
                    )
                    .slice(0, 15);
            } catch (error) {
                console.error('Failed to fetch offers', error);
            } finally {
                this.isLoadingOffers = false;
            }
        },
        handleResize() {
            if (window.innerWidth > 1500) {
                this.offersPerRow = 5;
            } else if (window.innerWidth > 1280) {
                this.offersPerRow = 4;
            } else if (window.innerWidth > 775) {
                this.offersPerRow = 3;
            } else {
                this.offersPerRow = 2;
            }
        },
        formatQuests(quests: any) {
            return quests.map((quest: TBaseQuest, index: number) => {
                const isLastInRow = index === quests.length - 1;
                return {
                    quest,
                    isAlone: quests.length % 2 !== 0 && isLastInRow,
                    isDaily: false,
                };
            });
        },
    },
});
</script>

<style lang="scss">
.my-nav .nav-link.active {
    --bs-nav-tabs-link-active-color: rgba(255, 255, 255, 0.7) !important;
    background: linear-gradient(180deg, #202023 0%, #000 84%) !important;
    --bs-nav-tabs-link-active-border-color: #232323 !important;
    --bs-nav-tabs-link-active-bg: #232323 !important;
}

.my-nav .nav-tabs {
    --bs-nav-tabs-border-color: #232323 !important;
    width: 50%;
}

.tab-content {
    position: relative;
}

.my-nav .card {
    background-color: #000;
    border-radius: 5px;
    border: 1px solid #262424;
    background-image: url('../../assets/bg-mosaic.png');
    background-size: cover;
}
.custom-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.rewards-select {
    appearance: none;
    width: 100px;
    border-radius: 4px;
    border: 1px solid rgba(77, 77, 77, 0.25);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    outline: none;
    padding: 8px 11px;
    text-overflow: ellipsis;
    padding-right: 30px;
    cursor: pointer;
}
.custom-select-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #fff;
}

.bg-quests {
    background-image: url('/src/assets/bg-quests.png');
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 15px !important;
    border: 1px dotted #f3d40760;
    margin: 6px;
}

.bg-rewards {
    //border: 1px dotted #f31a0760;
    border-top-left-radius: 13px !important;
    border-top-right-radius: 13px !important;
    overflow: hidden;
}

.my-nav .card-header {
    background: #0b0b0b;
    border-radius: 5px !important;
}

.my-nav .fa-calendar {
    color: #515151 !important;
}

.my-nav .btn {
    border-color: #af4545;
    background: linear-gradient(90deg, rgba(177, 70, 70, 0.75) 0%, rgba(114, 33, 33, 0.75) 100%);
}

.my-nav .badge.bg-primary {
    color: rgba(238, 238, 238, 0.7) !important;
    background: #000 !important;
}

.btn-primary {
    box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 4px 0px, rgba(255, 255, 255, 0.12) 0px 4px 4px 0px inset;
    border-radius: 5px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    overflow: hidden;
    background: var(--btn-primary-santa) !important;
    border: none;
    color: #ffffff;
}

.btn-primary:hover,
.btn-primary:active,
.btn-primary:disabled {
    background: var(--btn-primary-santa);
}
.my-leader {
    background-color: #151515;
}

.my-leader .text-primary {
    color: #515151 !important;
}

.my-leader .list-group-item {
    background-color: #1c1b1b;
    border-color: #262424;
}

.my-nav .tab-pane {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.gr-2 {
    width: 100% !important;
    //zoom: 0.75;
}

.gr-2 .card-body {
    height: 205px;
    min-height: 205px !important;
    max-height: 205px !important;
}

.quests-column {
    height: calc(100vh - 70px);
    margin-right: 20px;
    margin-left: 12px;
}

.quests-column .tab-content .card {
    overflow: hidden;
    border-radius: 0px;
}

.rewards-column {
    height: calc(100vh - 70px);
    position: sticky;
    top: 70px;
    background: radial-gradient(
            57.91% 58.02% at 50% 50%,
            rgba(0, 0, 0, 0) 0%,
            rgba(62, 0, 0, 0.05) 80.65%,
            rgba(112, 5, 5, 0.11) 100%
        ),
        rgba(0, 0, 0, 0.2);

    box-shadow: 0px 0px 49px 0px rgba(0, 7, 72, 0.12);
    border-radius: 15px;
    border: 1.5px solid rgba(166, 111, 111, 0.3);
    padding: 0 !important;
    margin-right: 20px;
}

.quests-title {
    backdrop-filter: brightness(0.3);
    overflow: hidden;
}

.quests-title i {
    line-height: 2;
}

.rewards-container {
    height: calc(100vh - 160px);
    overflow: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    padding: 15px;
    column-gap: 2%;
    margin-bottom: 8px;
}
.title-q {
    font-size: 25px;
    line-height: 25px;
    color: #fff;
    //color: #feff00;
    font-weight: 600;
    font-family: 'Poppins';
    font-style: italic;
}

.card-title {
    font-family: 'Kode Mono', monospace;
    font-size: 1rem;
}

.text-opaque {
    color: var(--body-text);
    font-family: Poppins;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    margin: 7px 0 7px 7px;
}

.offer-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    margin-left: 0;
    margin-right: 0;
    gap: 1%;
}

.offer-item {
    flex: 1 0 45%;
    //margin: 1%;
    max-width: 45%;
    box-sizing: border-box;
    background: var(--quest-item-bg);
    border-radius: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    //margin-bottom: 15px;
    .card {
        border: 0 !important;
        border-radius: 20px !important;
        img {
            border-radius: 4px;
            overflow: hidden;
            width: 100%;
            height: 162px;
            object-fit: cover;
        }
    }
}
.regular-quest {
    width: 100%;
    margin-bottom: 15px;
}
.regular-quest > .card {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

.quests-box {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 25px;
}

.offers-box {
    // background: var(--quest-item-bg);
    border-radius: 20px;
    // padding: 15px 20px;
    padding-bottom: 0;
    h3 {
        font-family: 'Poppins', sans-serif;
        color: var(--title-color);
        font-feature-settings: 'liga' off, 'clig' off;
        text-shadow: 0px 1px 9px rgba(255, 255, 255, 0.3);
        font-size: 18px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px;
    }
}
.quest-skeleton-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.quest-skeleton-loader {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 5px;
    background-color: #393939; /* Light gray background */
    animation: pulse 1.5s infinite;
}

.skeleton-title {
    height: 20px;
    width: 60%;
    margin-bottom: 10px;
    background-color: #c0c0c0; /* Slightly darker gray */
    border-radius: 4px;
}

.skeleton-description {
    height: 15px;
    width: 80%;
    margin-bottom: 10px;
    background-color: #c0c0c0;
    border-radius: 4px;
}

.skeleton-button {
    height: 25px;
    width: 40%;
    background-color: #c0c0c0;
    border-radius: 4px;
}

.skeleton-image {
    height: 130px;
    background-color: #c0c0c0;
    border-radius: 4px;
    margin-bottom: 10px;
}

.quests-column .nav-item {
    flex-grow: 0;
}
.nav-link {
    background: var(--nav-link-bg);
    color: #8e8e8e !important;
}
.quests-column .nav-link {
    width: 158px !important;
    display: flex;
    justify-content: center;

    border-bottom-color: transparent;
    border-bottom-width: 0px;
    color: #8e8e8e;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
}

.quests-column .nav-link.active {
    border-color: var(--nav-border-color);
    border-bottom-color: var(--border-as-nav-color) !important;
    border-bottom-width: 1px;
    font-weight: 600;
}
.nav-link.active {
    background-color: var(--nav-link-active-bg) !important;
    border-color: var(--nav-border-color) !important;
    color: var(--body-text) !important;
    font-weight: 600;
}

.quests-column .nav {
    border-bottom-color: var(--nav-border-color);
    gap: 3px;
}

.quest-group,
.reward-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.quest-item {
    height: 100%;
    //min-height: 275px;
    overflow: hidden;
    background-color: var(--quest-item-bg);
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.quest-item-daily,
.reward-item-promoted {
    grid-column: span 2;
}

.quest-group-title {
    color: var(--title-color);
    font-feature-settings: 'liga' off, 'clig' off;
    text-shadow: 0px 1px 9px rgba(255, 255, 255, 0.3);
    font-family: Poppins;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 18px;
    margin-bottom: 10px;
}

.reward-group {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
}

.text-muted {
    color: var(--body-text) !important;
}

.quest-modal-title {
    color: var(--modal-text-color);
    font-size: 17px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
}

.quest-modal-text {
    color: var(--modal-text-color);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 17px;
    margin-bottom: 10px;
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
    .quest-cont .row > * {
        flex-shrink: unset;
        display: flex;
        flex: 1;
        overflow: hidden;
        flex-direction: column;
        height: 100%;
        padding-bottom: 10px !important;
    }
    .quests-column {
        margin: 0 !important;
        padding: 0 12px !important;
    }
    .quest-cont {
        max-width: 100%;
        flex: 1;
        display: flex;
        overflow: hidden;
        flex-direction: column;
    }
    .rewards-column {
        width: 100% !important;
        margin: 0 12px;
        max-width: 100%;
    }
    .quest-cont .row {
        height: 100%;
        display: flex;
        flex: 1;
        overflow: hidden;
        flex-wrap: nowrap;
    }
    .rewards-column {
        position: relative;
        height: calc(100vh - 140px);
    }
    .rewards-container {
        height: calc(100vh - 205px);
    }
    .quests-box {
        height: 100%;
        overflow: hidden;
    }
    .reward-group {
        gap: 0;
        column-gap: 10px;
    }
    .quests-column .nav-item {
        flex: 1 1 30%;
        box-sizing: border-box;
    }
    .quests-column .nav-link {
        width: 100% !important;
    }
    .quest-item-daily,
    .reward-item-promoted {
        grid-column: span 2;
    }
    .quests-column .tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .quests-column .tabs .tab-content {
        flex: 1;
        overflow: auto;
    }
}
@media (max-width: 774px) {
    .quest-group,
    .reward-group {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .offer-row {
        gap: 10px;
    }
}

@media (max-width: 1400px) {
    .my-col-xl-7 {
        flex: 0 0 auto;
        width: 50%;
    }
}

@media (max-width: 1025px) {
    .quests-column {
        margin-right: 5px;
    }
}

@media (min-width: 1350px) {
    .offer-item {
        flex: 1 0 30%;
        //max-width: 30%;
    }

    .regular-quest {
        width: 49%;
        flex: 1 1 49%;
    }
}
@media (max-width: 576px) {
    .quest-group,
    .reward-group {
        grid-template-columns: repeat(1, 1fr);
        gap: 10px;
    }
    .quests-column {
        padding: 0 10px !important;
        margin: 0;
    }
    .quest-item-daily,
    .reward-item-promoted {
        grid-column: span 1;
    }
    .offer-item {
        flex: 1 0 100%;
        max-width: 100% !important;
    }
}

@media (min-width: 1400px) {
    .quest-cont {
        max-width: 100%;
    }
}
</style>
