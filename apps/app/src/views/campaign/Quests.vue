<template>
    <b-container>
        <b-row>
            <b-col lg="7" xl="6" offset-xl="1">
                <blockquote
                    v-if="!accountStore.isMobile"
                    class="mb-2 ps-3 d-flex align-items-center p-2"
                    style="background-color: rgba(0, 0, 0, 0.15)"
                >
                    <div>
                        <strong>Quests</strong>
                        <div class="text-opaque">Earn points with tasks</div>
                    </div>
                    <i class="fas fa-tasks text-opaque ms-auto me-3" style="font-size: 1.1rem" />
                </blockquote>
                <div v-if="questStore.isLoading" class="d-flex justify-content-center py-5">
                    <b-spinner variant="primary" small />
                </div>
                <b-tabs v-else content-class="mt-3" justified class="mt-3">
                    <b-tab active>
                        <template #title>
                            Available
                            <sup v-if="availableQuestCount">
                                <b-badge class="px-1 py-1 text-white" variant="danger">
                                    {{ availableQuestCount }}
                                </b-badge>
                            </sup>
                        </template>
                        <div v-for="(quest, key) of quests" :key="key" :class="{ 'd-none': !quest.isAvailable }">
                            <component
                                :is="questComponentMap[quest.variant]"
                                v-if="quest"
                                :quest="quest"
                                class="mb-2 mx-lg-0 my-lg-3"
                            />
                        </div>
                        <div v-if="!availableQuestCount" class="text-center mt-5">
                            <i class="h1 fas fa-trophy text-accent" />
                            <p class="lead text-accent">Well done!</p>
                            <p class="text-opaque">You have completed all available quests</p>
                        </div>
                    </b-tab>
                    <b-tab title="Completed">
                        <div v-for="(quest, key) of quests" :key="key" :class="{ 'd-none': quest.isAvailable }">
                            <component
                                :is="questComponentMap[quest.variant]"
                                :quest="quest"
                                class="mb-2 mx-lg-0 my-lg-3"
                            />
                        </div>
                    </b-tab>
                </b-tabs>
            </b-col>
            <b-col v-if="!accountStore.isMobile" lg="5" xl="4">
                <blockquote
                    class="mb-2 ps-3 d-flex align-items-center p-2"
                    style="background-color: rgba(0, 0, 0, 0.15)"
                >
                    <div>
                        <strong>Rewards</strong>
                        <div class="text-opaque">Spend your points!</div>
                    </div>
                    <i class="fas fa-gift text-opaque ms-auto me-3" style="font-size: 1.1rem" />
                </blockquote>
                <component
                    :is="componentMap[reward.variant]"
                    v-for="reward of rewardStore.rewards"
                    :reward="reward"
                    class="mb-2"
                />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { useRewardStore } from '../../stores/Reward';
import { RewardSortVariant } from '../../types/enums/rewards';
import { questComponentMap, sortMap } from '../../utils/quests';
import BaseCardQuestInvite from '../../components/card/BaseCardQuestInvite.vue';
import BaseCardQuestSocial from '../../components/card/BaseCardQuestSocial.vue';
import BaseCardQuestCustom from '../../components/card/BaseCardQuestCustom.vue';
import BaseCardQuestDaily from '../../components/card/BaseCardQuestDaily.vue';
import BaseCardQuestWeb3 from '../../components/card/BaseCardQuestWeb3.vue';
import BaseCardQuestGitcoin from '../../components/card/BaseCardQuestGitcoin.vue';
import BaseCardQuestWebhook from '../../components/card/BaseCardQuestWebhook.vue';
import { RewardVariant } from '../../types/enums/rewards';
import BaseCardRewardCoin from '../../components/card/BaseCardRewardCoin.vue';
import BaseCardRewardNFT from '../../components/card/BaseCardRewardNFT.vue';
import BaseCardRewardCustom from '../../components/card/BaseCardRewardCustom.vue';
import BaseCardRewardCoupon from '../../components/card/BaseCardRewardCoupon.vue';
import BaseCardRewardDiscordRole from '../../components/card/BaseCardRewardDiscordRole.vue';

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
    },
    data() {
        return {
            componentMap,
            questComponentMap,
            isLgScreen: window.innerWidth > 1000,
            selectedSort: { label: 'Default', key: RewardSortVariant.Default },
            activeFilters: [],
            entry: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
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
            return quests.sort(sortMap[this.selectedSort.key]).map((quest, index) => ({ ...quest, index }));
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            async handler(isAuthenticated: boolean) {
                if (!isAuthenticated) return;

                if (!this.accountStore.account) {
                    await this.accountStore.getAccount();
                }

                await Promise.all([
                    this.questStore.list(),
                    this.rewardStore.list(),
                    this.accountStore.getParticipants(),
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
});
</script>
