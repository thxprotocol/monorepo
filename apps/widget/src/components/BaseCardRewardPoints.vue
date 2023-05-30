<template>
    <BaseCardCollapse :visible="accountStore.isAuthenticated && !reward.isClaimed">
        <template #header>
            <div v-if="reward.platform" class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i :class="platformIconMap[reward.platform]" class="me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }}</div>
        </template>

        <b-card-text v-if="reward.description">
            {{ reward.description }}
        </b-card-text>

        <component :is="getInteractionComponent(reward.interaction)" :reward="reward" />

        <b-alert class="p-2" v-if="error && !isSubmitting" variant="danger" show>
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="primary" block class="w-100">
            Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
        </b-button>

        <b-button v-else-if="reward.isClaimed" variant="primary" block class="w-100" disabled> Reward claimed</b-button>

        <b-button
            v-else-if="reward.platform && !isConnected"
            variant="primary"
            block
            class="w-100"
            @click="onClickConnect"
            :disabled="isSubmitting"
        >
            <template v-if="isSubmitting">
                <b-spinner small></b-spinner>
                Connecting platform
            </template>
            <template v-else>
                Connect <strong>{{ RewardConditionPlatform[reward.platform] }}</strong>
            </template>
        </b-button>

        <b-button v-else variant="primary" block class="w-100" @click="onClickClaim" :disabled="isSubmitting">
            <template v-if="isSubmitting">
                <b-spinner small></b-spinner>
                Adding points...
            </template>
            <template v-else>
                Claim <strong>{{ reward.amount }} points</strong>
            </template>
        </b-button>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { WIDGET_URL } from '../config/secrets';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { RewardConditionPlatform, RewardConditionInteraction } from '../types/enums/rewards';
import BaseCardCollapse from '../components/BaseCardCollapse.vue';
import BaseBlockquoteTwitterTweet from './blockquote/BaseBlockquoteTwitterTweet.vue';
import BaseBlockquoteTwitterUser from './blockquote/BaseBlockquoteTwitterUser.vue';
import BaseBlockquoteYoutubeChannelSubscription from '../components/blockquote/BaseBlockquoteYoutubeChannelSubscription.vue';
import BaseBlockquoteVideo from '../components/blockquote/BaseBlockquoteVideo.vue';
import BaseBlockquoteDiscordServerJoin from '../components/blockquote/BaseBlockquoteDiscordServerJoin.vue';
import BaseBlockquoteDiscordInviteUsed from '../components/blockquote/BaseBlockquoteDiscordInviteUsed.vue';
import BaseBlockquoteShopifyNewsletterSubscription from '../components/blockquote/BaseBlockquoteShopifyNewsletterSubscription.vue';
import BaseBlockquoteShopifyOrderAmount from '../components/blockquote/BaseBlockquoteShopifyOrderAmount.vue';
import BaseBlockquoteShopifyTotalSpent from '../components/blockquote/BaseBlockquoteShopifyTotalSpent.vue';

export default defineComponent({
    name: 'BaseCardRewardPoints',
    components: {
        BaseCardCollapse,
        BaseBlockquoteYoutubeChannelSubscription,
        BaseBlockquoteVideo,
        BaseBlockquoteTwitterTweet,
        BaseBlockquoteTwitterUser,
        BaseBlockquoteDiscordServerJoin,
        BaseBlockquoteShopifyNewsletterSubscription,
        BaseBlockquoteShopifyOrderAmount,
        BaseBlockquoteShopifyTotalSpent,
        BaseBlockquoteDiscordInviteUsed,
    },
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    data: function (): any {
        return {
            error: '',
            isSubmitting: false,
            RewardConditionPlatform,
            RewardConditionInteraction,
            platformIconMap: {
                [RewardConditionPlatform.None]: '',
                [RewardConditionPlatform.YouTube]: 'fab fa-youtube',
                [RewardConditionPlatform.Twitter]: 'fab fa-twitter',
                [RewardConditionPlatform.Discord]: 'fab fa-discord',
                [RewardConditionPlatform.Shopify]: 'fab fa-shopify',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        isConnected() {
            const { account } = useAccountStore();
            if (!account || !this.reward) return;

            switch (this.reward.platform) {
                case RewardConditionPlatform.YouTube:
                    return account.youtubeManageAccess;
                case RewardConditionPlatform.Twitter:
                    return account.twitterAccess;
                case RewardConditionPlatform.Discord:
                    return account.discordAccess;
                case RewardConditionPlatform.Github:
                    return account.githubAccess;
                case RewardConditionPlatform.Twitch:
                    return account.twitchAccess;
                case RewardConditionPlatform.Shopify:
                    return account.email;
                default:
                    return true;
            }
        },
    },
    methods: {
        onClickSignin: function () {
            this.accountStore.signin();
        },
        onClickClaim: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;
                await this.rewardsStore.claimConditionalReward(this.reward._id);
            } catch (error) {
                this.error = error;
            } finally {
                this.isSubmitting = false;
            }
        },
        getInteractionComponent(interaction: RewardConditionInteraction) {
            switch (interaction) {
                case RewardConditionInteraction.YouTubeLike:
                    return 'BaseBlockquoteVideo';
                case RewardConditionInteraction.YouTubeSubscribe:
                    return 'BaseBlockquoteYoutubeChannelSubscription';
                case RewardConditionInteraction.TwitterLike:
                case RewardConditionInteraction.TwitterRetweet:
                    return 'BaseBlockquoteTwitterTweet';
                case RewardConditionInteraction.TwitterFollow:
                    return 'BaseBlockquoteTwitterUser';
                case RewardConditionInteraction.DiscordGuildJoined:
                    return 'BaseBlockquoteDiscordServerJoin';
                case RewardConditionInteraction.DiscordInviteUsed:
                    return 'BaseBlockquoteDiscordInviteUsed';
                case RewardConditionInteraction.ShopifyOrderAmount:
                    return 'BaseBlockquoteShopifyOrderAmount';
                case RewardConditionInteraction.ShopifyTotalSpent:
                    return 'BaseBlockquoteShopifyTotalSpent';
                case RewardConditionInteraction.ShopifyNewsletterSubscription:
                    return 'BaseBlockquoteShopifyNewsletterSubscription';
            }
        },
        getAccessTokenKindForPlatform(platform: RewardConditionPlatform) {
            switch (platform) {
                case RewardConditionPlatform.YouTube: {
                    return AccessTokenKind.YoutubeManage;
                }
                case RewardConditionPlatform.Twitter: {
                    return AccessTokenKind.Twitter;
                }
                case RewardConditionPlatform.Discord: {
                    return AccessTokenKind.Discord;
                }
            }
        },
        onClickConnect: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;

                await this.accountStore.api.userManager.cached.signinPopup({
                    extraQueryParams: {
                        channel: this.reward.platform,
                        prompt: 'connect',
                        return_url: WIDGET_URL + '/signin-popup.html',
                        access_token_kind: this.getAccessTokenKindForPlatform(this.reward.platform),
                    },
                });
                await this.accountStore.getAccount();
            } catch (error) {
                this.error = error;
                await this.accountStore.getAccount();
            } finally {
                this.isSubmitting = false;
                this.error = '';
                // As window.opener is set to null right after redirect from auth.thx to Twitter
                // we currently update account info on an error as this might be caused by the
                // opener not being available in the popup. User will need to run the popup flow twice.
                await this.accountStore.getAccount();
            }
        },
    },
});
</script>
