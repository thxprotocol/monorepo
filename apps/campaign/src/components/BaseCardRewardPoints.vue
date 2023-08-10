<template>
    <BaseCardCollapse :info-links="reward.infoLinks" :visible="!!authStore.oAuthShare && !reward.isClaimed">
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

        <b-alert class="p-2" v-model="isAlertDangerShown" variant="danger">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <template #button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
            </b-button>

            <b-button v-else-if="reward.isClaimed" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

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
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useAuthStore } from '../stores/Auth';
import { useRewardStore } from '../stores/Reward';
import { RewardConditionPlatform, RewardConditionInteraction } from '../types/enums/rewards';
import { getInteractionComponent, getConnectionStatus } from '../utils/social';
import BaseCardCollapse from '../components/BaseCardCollapse.vue';
import BaseBlockquoteTwitterTweet from './blockquote/BaseBlockquoteTwitterTweet.vue';
import BaseBlockquoteTwitterMessage from './blockquote/BaseBlockquoteTwitterMessage.vue';
import BaseBlockquoteTwitterUser from './blockquote/BaseBlockquoteTwitterUser.vue';
import BaseBlockquoteYoutubeChannelSubscription from '../components/blockquote/BaseBlockquoteYoutubeChannelSubscription.vue';
import BaseBlockquoteVideo from '../components/blockquote/BaseBlockquoteVideo.vue';
import BaseBlockquoteDiscordServerJoin from '../components/blockquote/BaseBlockquoteDiscordServerJoin.vue';
import BaseBlockquoteDiscordInviteUsed from '../components/blockquote/BaseBlockquoteDiscordInviteUsed.vue';

export default defineComponent({
    name: 'BaseCardRewardPoints',
    components: {
        BaseCardCollapse,
        BaseBlockquoteYoutubeChannelSubscription,
        BaseBlockquoteVideo,
        BaseBlockquoteTwitterTweet,
        BaseBlockquoteTwitterMessage,
        BaseBlockquoteTwitterUser,
        BaseBlockquoteDiscordServerJoin,
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
            getInteractionComponent,
            platformIconMap: {
                [RewardConditionPlatform.None]: '',
                [RewardConditionPlatform.YouTube]: 'fab fa-youtube',
                [RewardConditionPlatform.Twitter]: 'fab fa-twitter',
                [RewardConditionPlatform.Discord]: 'fab fa-discord',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useRewardStore),
        isConnected() {
            const { account } = useAccountStore();
            if (!account || !this.reward) return;

            return getConnectionStatus(account, this.reward.platform);
        },
        isAlertDangerShown() {
            return !!this.error && !this.isSubmitting;
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
                debugger;
            } finally {
                this.isSubmitting = false;
            }
        },
        onClickConnect: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.accountStore.connect(this.reward.platform);
                await this.accountStore.waitForConnectionStatus(this.reward.platform);
            } catch (error) {
                this.error = error;
                await this.accountStore.getAccount();
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
