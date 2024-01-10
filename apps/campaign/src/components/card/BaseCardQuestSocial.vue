<template>
    <BaseCardCollapse
        :quest="quest"
        :info-links="quest.infoLinks"
        :visible="!!authStore.oAuthShare && !quest.isClaimed"
        @modal-close="isModalQuestEntryShown = false"
        :id="quest._id"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :amount="quest.pointsAvailable"
        :error="error"
        :image="quest.image"
    >
        <template #header>
            <div v-if="quest.platform" class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i :class="platformIconMap[quest.platform]" class="me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <component :is="getInteractionComponent(quest.interaction)" :reward="quest" />

        <template #button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="primary" block class="w-100">
                <template v-if="quest.pointsAvailable > 0">
                    Sign in &amp; claim <strong>{{ quest.pointsAvailable }} points</strong>
                </template>
                <template v-else> Sign in &amp; Complete Quest </template>
            </b-button>

            <b-button v-else-if="quest.isClaimed" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <BButtonGroup block class="w-100" v-else-if="quest.platform && !isConnected">
                <b-button variant="primary" @click="onClickConnect" :disabled="isSubmitting">
                    <template v-if="isSubmitting">
                        <b-spinner small class="me-1" />
                        Connecting platform...
                    </template>
                    <template v-else>
                        Connect <strong>{{ RewardConditionPlatform[quest.platform] }}</strong>
                    </template>
                </b-button>
                <BButton v-if="isSubmitting" @click="onClickCancel" variant="primary" style="max-width: 40px">
                    <i class="fas fa-times text-opaque" />
                </BButton>
            </BButtonGroup>

            <b-button
                v-else
                variant="primary"
                block
                class="w-100"
                @click="onClickClaim"
                :disabled="isSubmitting || !quest.pointsAvailable"
            >
                <template v-if="isSubmitting">
                    <b-spinner small></b-spinner>
                    Adding points...
                </template>
                <template v-else>
                    Claim <strong>{{ quest.pointsAvailable }} points</strong>
                </template>
            </b-button>
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useRewardStore } from '../../stores/Reward';
import { RewardConditionPlatform, RewardConditionInteraction } from '../../types/enums/rewards';
import { getInteractionComponent, getConnectionStatus, platformIconMap } from '../../utils/social';
import BaseBlockquoteTwitterTweet from '../blockquote/BaseBlockquoteTwitterTweet.vue';
import BaseBlockquoteTwitterMessage from '../blockquote/BaseBlockquoteTwitterMessage.vue';
import BaseBlockquoteTwitterUser from '../blockquote/BaseBlockquoteTwitterUser.vue';
import BaseBlockquoteYoutubeChannelSubscription from '../../components/blockquote/BaseBlockquoteYoutubeChannelSubscription.vue';
import BaseBlockquoteVideo from '../../components/blockquote/BaseBlockquoteVideo.vue';
import BaseBlockquoteDiscordServerJoin from '../../components/blockquote/BaseBlockquoteDiscordServerJoin.vue';
import BaseBlockquoteDiscordMessage from '../../components/blockquote/BaseBlockquoteDiscordMessage.vue';
import BaseBlockquoteDiscordInviteUsed from '../../components/blockquote/BaseBlockquoteDiscordInviteUsed.vue';

export default defineComponent({
    name: 'BaseCardQuestSocial',
    components: {
        BaseBlockquoteYoutubeChannelSubscription,
        BaseBlockquoteVideo,
        BaseBlockquoteTwitterTweet,
        BaseBlockquoteTwitterMessage,
        BaseBlockquoteTwitterUser,
        BaseBlockquoteDiscordServerJoin,
        BaseBlockquoteDiscordInviteUsed,
        BaseBlockquoteDiscordMessage,
    },
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data() {
        return {
            error: '',
            isSubmitting: false,
            RewardConditionPlatform,
            RewardConditionInteraction,
            getInteractionComponent,
            platformIconMap,
            tooltipContent: 'Copy URL',
            isModalQuestEntryShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useRewardStore),
        isConnected() {
            const { account } = useAccountStore();
            if (!account) return;
            return getConnectionStatus(account as any, this.quest.platform);
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler(isAuthenticated: boolean) {
                if (!isAuthenticated) return;
                this.rewardsStore.getSocialQuest(this.quest._id);
            },
            immediate: true,
        },
    },
    methods: {
        onClickCancel() {
            this.isSubmitting = false;
        },
        onClickSignin() {
            this.accountStore.signin();
        },
        async onClickClaim() {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.isModalQuestEntryShown = true;
                await this.rewardsStore.completeSocialQuest(this.quest._id);
            } catch (error) {
                const err = error as Error;
                this.error = err.message ? err.message : 'Could not claim points.';
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        onClickConnect: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.accountStore.connect(this.quest.platform);

                await this.accountStore.waitForConnectionStatus(this.quest.platform);
            } catch (error) {
                this.error = 'Could not connect platform.';
                console.error(error);
                await this.accountStore.getAccount();
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
