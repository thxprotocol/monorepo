<template>
    <b-card class="m-2 disabled">
        <b-card-title class="d-flex">
            <div v-if="reward.platform" class="me-2">
                <img height="25" :src="platformImg[reward.platform]" :alt="reward.platform" />
            </div>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <blockquote class="d-flex" v-if="reward.platform && reward.interaction">
            {{ interactionLabel[reward.interaction] }}
            <b-link v-if="content" :href="content.url" target="_blank" class="text-muted ms-auto">
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </blockquote>

        <b-alert class="p-2" v-if="error && !isSubmitting" variant="danger" show>
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-button
            v-if="!reward.platform || (reward.platform && isConnected)"
            variant="primary"
            block
            class="w-100"
            @click="onClick"
            :disabled="isSubmitting || reward.isClaimed"
        >
            <template v-if="reward.isClaimed"> Reward claimed</template>
            <template v-else-if="isSubmitting">
                <b-spinner small></b-spinner>
                Adding points...
            </template>
            <template v-else>
                Claim <strong>{{ reward.amount }} points</strong>
            </template>
        </b-button>

        <b-button v-if="reward.platform && !isConnected" variant="primary" block class="w-100" @click="onClick">
            Connect <strong>{{ RewardConditionPlatform[reward.platform] }}</strong>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { RewardConditionPlatform, RewardConditionInteraction } from '../types/enums/rewards';

export default defineComponent({
    name: 'BaseCardRewardPoints',
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
            platformImg: {
                [RewardConditionPlatform.None]: '',
                [RewardConditionPlatform.Google]: require('../assets/google-logo.png'),
                [RewardConditionPlatform.Twitter]: require('../assets/twitter-logo.png'),
            },
            interactionLabel: {
                [RewardConditionInteraction.YouTubeLike]: 'Like a Youtube video.',
                [RewardConditionInteraction.YouTubeSubscribe]: 'Subscribe to a Youtube channel.',
                [RewardConditionInteraction.TwitterLike]: 'Like a Twitter tweet.',
                [RewardConditionInteraction.TwitterRetweet]: 'Retweet a Twitter tweet.',
                [RewardConditionInteraction.TwitterFollow]: 'Follow a Twitter account.',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        isConnected: function () {
            if (!this.reward.platform || !this.accountStore.account) return;
            return this.accountStore.isConnected[this.reward.platform];
        },
        content: function () {
            if (!this.reward.interaction || !this.reward.content) return;
            return this.getChannelActionURL(this.reward.interaction, this.reward.content);
        },
    },
    mounted() {
        this.rewardsStore.getPointReward(this.reward._id as string);
    },
    methods: {
        getChannelActionURL(interaction: RewardConditionInteraction, content: string) {
            switch (interaction) {
                case RewardConditionInteraction.YouTubeLike:
                    return { url: `https://youtu.be/${content}` };
                case RewardConditionInteraction.YouTubeSubscribe:
                    return { url: `https://youtube.com/channel/${content}` };
                case RewardConditionInteraction.TwitterLike:
                    return { url: `https://www.twitter.com/twitter/status/${content}` };
                case RewardConditionInteraction.TwitterRetweet:
                    return { url: `https://www.twitter.com/twitter/status/${content}` };
                case RewardConditionInteraction.TwitterFollow:
                    return { url: `https://www.twitter.com/i/user/${content}` };
                default:
                    return '';
            }
        },
        onClick: async function () {
            this.error = '';
            this.isSubmitting = true;
            if (!this.accountStore.isAuthenticated) {
                this.accountStore.api.signin();
            }
            if (this.reward.platform && !this.isConnected) {
                await this.accountStore.api.userManager.cached.signinPopup({
                    extraQueryParams: {
                        channel: this.reward.platform,
                        prompt: 'connect',
                        return_url: window.location.href,
                    },
                });
            } else {
                try {
                    await this.rewardsStore.claim(this.reward.uuid);
                } catch (error) {
                    this.error = error;
                }
            }
            this.isSubmitting = false;
        },
    },
});
</script>
