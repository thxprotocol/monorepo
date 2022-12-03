<template>
    <b-card class="m-2">
        <b-card-title class="d-flex">
            <div v-if="reward.platform" class="me-2">
                <img height="25" :src="platformImg[reward.platform]" :alt="reward.platform" />
            </div>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
            <b-link :href="content.url" v-if="content">
                <i class="fas fa-link text-muted"></i>
            </b-link>
        </b-card-text>

        <b-button variant="primary" block class="w-100" @click="onClick">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { RewardConditionInteraction } from '../types/enums/rewards';
import { Brands } from '../utils/social';

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
            platformImg: {
                [Brands.None]: '',
                [Brands.Google]: require('../assets/google-logo.png'),
                [Brands.Twitter]: require('../assets/twitter-logo.png'),
            },
            tooltipContent: 'Copy URL',
            referralUrl: `https://xyz.com?referral=${this.reward.uuid}`,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        content: function () {
            if (!this.reward.interaction || !this.reward.content) return;
            return this.getChannelActionURL(this.reward.interaction, this.reward.content);
        },
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
        onClick: function () {
            if (this.accountStore.isAuthenticated) {
                this.rewardsStore.claim(this.reward.uuid);
            } else {
                this.accountStore.api.signin();
            }
        },
    },
});
</script>
