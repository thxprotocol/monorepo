<template>
    <b-container v-if="selectedPart === 'quests' || selectedPart === 'rewards'" class="quest-cont">
        <b-row>
            <b-col
                v-if="selectedPart === 'quests'"
                lg="6"
                xl="7"
                offset-xl="0"
                class="quests-column flex-grow-1 my-col-xl-7"
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
                <div class="d-flex gap-2 sticky-tabs">
                    <div
                        v-if="[0, 1].includes(activeTab)"
                        ref="filterDropdown"
                        class="filter-wrapper"
                        @click="toggleDropdown"
                    >
                        <div class="custom-dropdown">
                            <span class="selected-option">{{ selectedQuestFilterLabel }}</span>
                            <img :src="dropdownIcon" alt="dropdown" height="3.91" width="6.76" />
                        </div>
                        <transition name="fade">
                            <ul v-if="showDropdown" class="custom-dropdown-options" @click.stop>
                                <li
                                    v-for="filter in questFilters"
                                    :key="filter.value"
                                    @click="selectFilter(filter.value)"
                                >
                                    {{ filter.label }}
                                </li>
                            </ul>
                        </transition>
                    </div>
                    <div ref="tabDropdown" class="filter-wrapper" @click="toggleTabDropdown">
                        <div class="custom-dropdown tabs-wrapper">
                            <span class="selected-option">{{ currentTabLabel }}</span>
                            <img
                                :src="dropdownIcon"
                                alt="dropdown"
                                height="3.91"
                                width="6.76"
                                style="filter: var(--invert-img)"
                            />
                        </div>
                        <transition name="fade">
                            <ul v-if="showTabDropdown" class="custom-dropdown-options" @click.stop>
                                <li v-for="tab in tabs" :key="tab.index" @click="setActiveTab(tab.index)">
                                    {{ tab.label }}
                                </li>
                            </ul>
                        </transition>
                    </div>
                </div>
                <div v-if="activeTab === 0">
                    <!-- Available content -->
                    <div class="quests-box">
                        <div v-if="questStore.isLoading || isLoadingOffers" class="d-flex justify-content-center">
                            <div class="w-100 quest-skeleton-group">
                                <div v-for="n in 10" :key="n" class="quest-skeleton-loader mb-3">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-description"></div>
                                    <div class="skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="d-flex flex-column gap-5">
                            <div v-for="group in filteredQuests" :key="group.title">
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
                                >
                                    <h3 class="quest-group-title">{{ group.title }}</h3>
                                    <div class="quest-group">
                                        <div
                                            v-for="quest in group.quests"
                                            :key="quest._id"
                                            :class="{
                                                'd-none': quest.variant === 0 ? quest.isCompleted : !quest.isAvailable,
                                                'quest-item': true,
                                            }"
                                            class="quest-group-item"
                                        >
                                            <component
                                                :is="questComponentMap[quest.variant]"
                                                :quest="quest"
                                                :group-title="group.title"
                                            />
                                        </div>
                                        <div
                                            v-if="group.title === 'Santa\'s Quests'"
                                            class="quest-item quest-group-item"
                                        >
                                            <BaseCardQuestReferral
                                                :referral="
                                                    'https://santabrowser.com/download?install_referrer=' + hashedCode
                                                "
                                                :imageurl="'https://thx-public.s3.ap-south-1.amazonaws.com/newreferral-neGnhMMfjymfApS8jx7BaJ.jpg'"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="offers-box">
                                    <h3 class="quest-group-title">{{ group.title }}</h3>
                                    <div class="offer-row">
                                        <div v-for="offer in group.offers" :key="offer.id" class="offer-item">
                                            <OfferCard :offer="offer" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="!availableQuestCount" class="text-center mt-5">
                                <i class="h1 fas fa-trophy text-accent" />
                                <p class="lead text-accent">Well done!</p>
                                <p class="text-opaque">You have completed all available quests</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="activeTab === 1">
                    <div class="quests-box">
                        <div v-if="questStore.isLoading" class="d-flex justify-content-center">
                            <div class="w-100 quest-skeleton-group">
                                <div v-for="n in 10" :key="n" class="quest-skeleton-loader mb-3">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-description"></div>
                                    <div class="skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="d-flex flex-column gap-5">
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
                            >
                                <h3 class="quest-group-title">{{ group.title }}</h3>
                                <div class="quest-group">
                                    <div
                                        v-for="quest in group.quests"
                                        :key="quest._id"
                                        :class="{
                                            'd-none': quest.isAvailable === true,
                                            'quest-item': true,
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
                                class="text-center text-muted mt-3 text-opaque empty-message"
                            >
                                You haven't completed any quests yet.
                            </div>
                        </div>
                    </div>
                </div>
            </b-col>
            <b-col
                v-if="selectedPart === 'rewards'"
                lg="5"
                xl="5"
                xxl="4"
                class="quests-column flex-grow-1"
                offset-xl="0"
            >
                <!-- Rewards Tabs Dropdown (mimicking quests design) -->
                <div class="d-flex gap-2 sticky-tabs">
                    <div ref="rewardTabDropdown" class="filter-wrapper" @click="toggleRewardTabDropdown">
                        <div class="custom-dropdown tabs-wrapper">
                            <span class="selected-option">{{ rewardCurrentTabLabel }}</span>
                            <img
                                :src="dropdownIcon"
                                alt="dropdown"
                                height="3.91"
                                width="6.76"
                                style="filter: var(--invert-img)"
                            />
                        </div>
                        <transition name="fade">
                            <ul v-if="showRewardTabDropdown" class="custom-dropdown-options" @click.stop>
                                <li v-for="tab in rewardTabs" :key="tab.index" @click="setActiveRewardTab(tab.index)">
                                    {{ tab.label }}
                                </li>
                            </ul>
                        </transition>
                    </div>
                </div>

                <!-- Rewards Content -->
                <div v-if="activeRewardTab === 0">
                    <!-- Available Rewards -->
                    <div class="quests-box">
                        <div
                            v-if="rewardStore.isLoading || reward2Store.isLoading"
                            class="d-flex justify-content-center"
                        >
                            <div class="w-100 quest-skeleton-group">
                                <div v-for="n in 10" :key="n" class="quest-skeleton-loader mb-3">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-description"></div>
                                    <div class="skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="reward-group">
                            <div
                                v-for="reward in availableRewards"
                                :key="reward._id"
                                :class="[reward.isPromoted ? 'reward-item-promoted' : 'reward-item']"
                            >
                                <component :is="componentMap[reward.variant]" :reward="reward" />
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="activeRewardTab === 1">
                    <!-- Completed Rewards -->
                    <div class="quests-box">
                        <div
                            v-if="rewardStore.isLoading || reward2Store.isLoading"
                            class="d-flex justify-content-center"
                        >
                            <div class="w-100 quest-skeleton-group">
                                <div v-for="n in 10" :key="n" class="quest-skeleton-loader mb-3">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-description"></div>
                                    <div class="skeleton-button"></div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="reward-group">
                            <div
                                v-for="reward in completedRewards"
                                :key="reward._id"
                                :class="{ 'reward-item-promoted': reward.isPromoted }"
                                class="reward-item"
                            >
                                <component :is="componentMap[reward.variant]" :reward="reward" />
                            </div>
                            <div
                                v-if="!completedRewards.length"
                                class="text-center text-muted mt-3 text-opaque empty-message"
                            >
                                You haven't completed any rewards yet.
                            </div>
                        </div>
                    </div>
                </div>
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
import { useTrackPageview } from '../utils/snowplowTracker';
import BaseCardQuestReferral from './card/BaseCardQuestReferral.vue';
import imgRefferal from '@thxnetwork/app/assets/referral.jpg';
import * as crypto from 'crypto';
import dropdownIcon from '@thxnetwork/app/assets/dropdown.png';

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
            offers: [] as any[],
            offersPerRow: this.calculateOffersPerRow(),
            isLoadingOffers: false,
            selectedQuestFilter: 'all', // initial selection
            questFilters: [
                { label: 'All Quests', value: 'all' },
                { label: 'Santa', value: 'santa' },
                { label: 'X', value: 'x' },
                { label: 'Discord', value: 'discord' },
                // { label: 'Youtube Quest', value: 'youtube' },
            ],
            showDropdown: false,
            activeTab: 0,
            hashedCode: '',
            tabs: [
                { label: 'Available', index: 0 },
                { label: 'Completed', index: 1 },
            ],
            showTabDropdown: false,
            dropdownIcon,
            activeRewardTab: 0,
            rewardTabs: [
                { label: 'Available', index: 0 },
                { label: 'Completed', index: 1 },
            ],
            showRewardTabDropdown: false,
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
            return quests
                .sort(sortMap[this.selectedSort.key])
                .map((quest: any, index: number) => ({ ...quest, index }));
        },
        mergedRewards() {
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

            santaQuests.sort((a, b) => {
                if (a.variant === QuestVariant.Daily && b.variant !== QuestVariant.Daily) {
                    return -1;
                } else if (a.variant !== QuestVariant.Daily && b.variant === QuestVariant.Daily) {
                    return 1;
                }
                return 0;
            });

            xQuests.sort((a: any, b: any) => a.amount - b.amount);

            const groupedQuests = [
                { title: "Santa's Quests", quests: santaQuests },
                { title: 'X Quests', quests: xQuests },
                { title: 'Discord Quests', quests: discordQuests },
                { title: 'YouTube Quests', quests: youtubeQuests },
                { title: 'Other Quests', quests: otherQuests },
            ];

            const merged = [];
            let offerIndex = 0;

            groupedQuests.forEach((group, index) => {
                const hasAvailableQuests = group.quests.some((quest) => quest.isAvailable);

                merged.push(group);

                if (hasAvailableQuests && index < groupedQuests.length - 2 && offerIndex < this.offers.length) {
                    const offersForGroup = this.offers.slice(offerIndex, offerIndex + this.offersPerRow);
                    merged.push({
                        title: 'Top Performing Offers',
                        isOfferRow: true,
                        offers: offersForGroup,
                    });
                    offerIndex += this.offersPerRow;
                }
            });

            if (offerIndex < this.offers.length) {
                const remainingOffers = this.offers.slice(offerIndex);
                merged.push({
                    title: 'Top Performing Offers',
                    isOfferRow: true,
                    offers: remainingOffers,
                });
            }
            return merged;
        },
        filteredCompletedQuests() {
            const completedQuests = this.mergedQuestsAndOffers.filter((group) => !group.isOfferRow);

            if (this.selectedQuestFilter === 'all') return completedQuests;

            return completedQuests.filter((group) => {
                switch (this.selectedQuestFilter) {
                    case 'santa':
                        return group.title === "Santa's Quests";
                    case 'x':
                        return group.title === 'X Quests';
                    case 'discord':
                        return group.title === 'Discord Quests';
                    case 'youtube':
                        return group.title === 'YouTube Quests';
                    default:
                        return true;
                }
            });
        },
        filteredQuests() {
            if (this.selectedQuestFilter === 'all') return this.mergedQuestsAndOffers;

            return this.mergedQuestsAndOffers.filter((group) => {
                if (group.isOfferRow) return false;

                switch (this.selectedQuestFilter) {
                    case 'santa':
                        return group.title === "Santa's Quests";
                    case 'x':
                        return group.title === 'X Quests';
                    case 'discord':
                        return group.title === 'Discord Quests';
                    case 'youtube':
                        return group.title === 'YouTube Quests';
                    default:
                        return true;
                }
            });
        },
        selectedQuestFilterLabel() {
            const f = this.questFilters.find((f) => f.value === this.selectedQuestFilter);
            return f ? f.label : 'All Quests';
        },
        currentTabLabel() {
            return this.tabs[this.activeTab].label;
        },
        otherTabs(): Array<{ label: string; index: number }> {
            return this.tabs.filter((tab) => tab.index !== this.activeTab);
        },
        rewardCurrentTabLabel(): string {
            return this.rewardTabs[this.activeRewardTab].label;
        },
        availableRewards() {
            return this.mergedRewards.filter((reward) => reward.isAvailable && !reward.isLimitReached);
        },
        completedRewards() {
            return this.mergedRewards.filter((reward) => !reward.isAvailable || reward.isLimitReached);
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
        useTrackPageview();
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        async fetchOffers() {
            this.isLoadingOffers = true;
            try {
                const clid = this.accountStore.account?.providerUserId;
                this.hashedCode = this.hashClid(clid);
                const response = await axios.get(
                    `https://offers-api.santabrowser.com/offers/list?&pageNo=0&clid=${clid}`,
                );
                const trendingOffers = response.data.trending.slice(0, 10);
                const dataOffers = response.data.data.slice(0, 10);

                this.offers = [...trendingOffers, ...dataOffers];
            } catch (error) {
                console.error('Failed to fetch offers', error);
            } finally {
                this.isLoadingOffers = false;
            }
        },
        hashClid(clientId: any) {
            // Create a SHA1 hash of the clid
            const sha1Hash = crypto.createHash('sha1').update(Buffer.from(clientId, 'utf-8')).digest('hex');
            // Take the substring from position 6 to 20
            const substring = sha1Hash.substring(6, 20);
            return substring;
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
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        selectFilter(value: string) {
            this.selectedQuestFilter = value;
            this.showDropdown = false;
        },
        handleClickOutside(event: MouseEvent) {
            try {
                const dropdown = this.$refs.filterDropdown as HTMLElement;
                if (!dropdown.contains(event.target as Node)) {
                    this.showDropdown = false;
                }
            } catch (error) {
                const errorMessage = error;
            }
        },
        setActiveTab(index: number) {
            this.activeTab = index;
            this.showTabDropdown = false;
        },
        toggleTabDropdown() {
            this.showTabDropdown = !this.showTabDropdown;
        },
        toggleRewardTabDropdown() {
            this.showRewardTabDropdown = !this.showRewardTabDropdown;
        },
        setActiveRewardTab(index: number) {
            this.activeRewardTab = index;
            this.showRewardTabDropdown = false;
        },

        calculateOffersPerRow() {
            const containerWidth = window.innerWidth;
            if (containerWidth > 1560) return 8;
            if (containerWidth > 1400) return 7;
            if (containerWidth > 1240) return 6;
            if (containerWidth > 1080) return 5;
            if (containerWidth > 992) return 4;
            if (containerWidth < 992) return 10;
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
    position: relative;
    border-radius: 5px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    overflow: hidden;
    background: var(--btn-primary-santa) !important;
    border: 1px solid transparent;
    color: #ffffff;
    transition: background 0.15s ease-in-out, border-color 0.3s ease;
    z-index: 0;
    padding: 7px 2px;
}
.btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: transparent;
    transition: opacity 0.3s ease;
    opacity: 1;
}

.btn-primary:hover::before {
    background: var(--btn-primary-santa-hover);
    opacity: 1;
}

.btn-primary:hover,
.btn-primary:active,
.btn-primary:disabled,
.btn-primary:focus-visible {
    background: var(--btn-primary-santa);
    border-color: transparent !important;
    box-shadow: inherit;
}
.btn-primary:disabled {
    background: var(--btn-disabled-bg) !important;
    border: 1px solid var(--btn-disabled-border);
    opacity: 0.55;
    color: var(--btn-disabled-color);
    font-weight: 500;
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
    min-height: 180px !important;
    max-height: 205px !important;
}

.quests-column {
    height: calc(100vh - 70px);
    margin-right: 20px;
    overflow: hidden;
    padding: 0;
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
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 140px;
    gap: 20px;
    scrollbar-width: none;
    padding: 5px 0;
}

.offer-item {
    //flex: 1 0 45%;
    //margin: 1%;
    //max-width: 45%;
    box-sizing: border-box;
    background: var(--quest-item-bg);
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    //margin-bottom: 15px;
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: scale(1.02);
        cursor: pointer;
    }
    .card {
        border: 0 !important;
        border-radius: 10px !important;
        img {
            border-radius: 4px;
            overflow: hidden;
            width: 100%;
            height: 96px;
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
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 25px;
    margin-top: 24px;

    scrollbar-width: none;
    -ms-overflow-style: none;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.quest-skeleton-loader {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 5px;
    background-color: var(--skeleton-item-bg);
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
    border-color: var(--nav-border-color) !important;
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
    position: relative;
    border-bottom-color: var(--nav-border-color);
    gap: 3px;
    border: none;
}

.quests-column .nav-item .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 157px;
    width: 70%;
    height: 1px;
    background: var(--border-tab-gradient);
}
.quests-column .nav-item .nav-link.active::before {
    content: '';
    position: absolute;
    bottom: -1px;
    height: 1px;
    background: var(--nav-border-color);
}
.quests-column .nav-item:nth-child(1) .nav-link.active::before {
    display: none;
}
.quests-column .nav-item:nth-child(2) .nav-link.active::after {
    left: 319px;
    width: 60%;
}
.quests-column .nav-item:nth-child(2) .nav-link.active::before {
    left: 0;
    width: 161px;
}
.quests-column .nav-item:nth-child(3) .nav-link.active::after {
    left: 480px;
    width: 50%;
}
.quests-column .nav-item:nth-child(3) .nav-link.active::before {
    left: 0;
    width: 322px;
}

.quest-group,
.reward-group {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.quest-item {
    // min-height: 265px;
    overflow: hidden;
    // background-color: var(--quest-item-bg);
    border-radius: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    min-height: 280px;
}
.quest-item-daily {
    background-color: var(--quest-item-bg);
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.quest-item-daily {
    grid-column: span 2;
}
.reward-item-promoted {
    grid-column: span 3;
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

.filter-wrapper {
    display: flex;
    position: relative;
}

.custom-dropdown {
    display: flex;
    align-items: center;
    background: var(--btn-primary-santa);
    padding: 0px 12px;
    border-radius: 5px;
    position: relative;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
    padding: 8px 12px;
    border: 1px solid var(--dropdown-border-color);
    color: #fff;
    min-width: 100px;
}

.selected-option {
    margin-right: 20px;
    font-size: 12px;
    white-space: nowrap;
}

.custom-dropdown-options {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    border-radius: 5px;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 999;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--dropdown-border-color);
    background: var(--dropdown-background);
    li {
        padding: 8px 12px;
        font-size: 12px;
        color: var(--body-text);
        &:hover {
            background: var(--dropdown-border-color);
        }
        cursor: pointer;
    }
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
.reward-item {
    grid-column: span 2;
}
.tabs-wrapper {
    background: var(--tabs-bg);
    color: var(--body-text);
    box-shadow: var(--balance-box-shadow);
}
.quest-cont {
    margin: 0;
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
        // overflow: hidden;
        flex-direction: column;
        height: 100%;
        padding-bottom: 10px !important;
        margin: 0;
        padding-top: 10px;
        padding: 0 0 10px 0;
    }
    .quest-cont {
        max-width: 100%;
        flex: 1;
        display: flex;
        // overflow: hidden;
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
        // overflow: hidden;
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
        margin: 0;
        margin-top: 22px;
    }
    .reward-group {
        gap: 0;
        column-gap: 10px;
        row-gap: 10px;
    }
    .quests-column .nav-item {
        flex: 1 1 20%;
        box-sizing: border-box;
    }
    .quests-column .nav-link {
        width: 100% !important;
        padding: 12px 16px;
    }
    .quest-item {
        grid-column: span 1;
        min-width: 235px;
    }
    .quest-item-daily {
        grid-column: span 2;
    }
    .quests-column .tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        // overflow: hidden;
    }
    .quests-column .tabs > div:first-child {
        padding-top: 15px;
        position: sticky;
        top: -5px;
        z-index: 22;
        background-color: var(--sticky-header-bg);
        padding-bottom: 10px;
    }
    .quests-column .tabs .tab-content {
        flex: 1;
        margin-top: 10px;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 0 10px;
    }
    .nav-link.active::before,
    .nav-link.active::after {
        display: none;
    }
    .quests-column .nav {
        //border-bottom: 1px solid var(--nav-border-color);
        align-items: center;
    }

    .filter-wrapper {
        position: relative;
        margin: 0;
        top: 0;
        left: 0;
    }
    .quest-group {
        grid-auto-flow: column;
        grid-auto-columns: 260px;
        overflow-x: auto;
        grid-template-columns: none;
    }
    .offer-row {
        gap: 20px;
        display: grid !important;
        grid-auto-flow: column;
        grid-auto-columns: 140px;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        grid-template-columns: none;
    }

    .reward-item-promoted {
        grid-column: 1/-1;
    }
    .quests-column {
        overflow: unset;
    }
    .sticky-tabs {
        position: sticky;
        top: -5px;
        padding: 15px 0;
        background: var(--body-rewards-bg);
        z-index: 111;
    }
}
@media (max-width: 774px) {
    .reward-group {
        grid-template-columns: repeat(2, 1fr);
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
    .reward-group {
        grid-template-columns: repeat(1, 1fr);
        gap: 10px;
    }
    .reward-item-promoted {
        grid-column: span 2;
    }
    .offer-item {
        flex: 1 0 100%;
        max-width: 100% !important;
        width: 100% !important;
    }
}
@media (max-width: 340px) {
    .quests-column .nav-link {
        padding: 10px;
        font-size: 10px;
    }
}
@media (min-width: 1400px) {
    .quest-cont {
        max-width: 100%;
    }
}
@media (max-width: 476px) {
    .quests-column .nav-link {
        padding: 12px 12px;
    }
    .filter-wrapper {
        height: 28px;
    }
    .quests-column .nav-item {
        flex: 1 1 0;
    }
}
@media (max-width: 447px) {
    .quests-column .nav-link {
        padding: 12px 5px;
    }
}
@media (max-width: 388px) {
    .quests-column .nav-link {
        font-size: 10px;
    }
    .quests-column .nav {
        border: none;
    }

    .quests-column .nav {
        overflow-x: auto;
        width: 100%;
        flex-wrap: nowrap;
        scrollbar-width: none;
    }
    .custom-dropdown {
        width: 105px;
    }
}
</style>
