<template>
    <BaseCardCollapse
        :quest="quest"
        :info-links="quest.infoLinks"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        @modal-close="isModalQuestEntryShown = false"
        :id="quest._id"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :amount="quest.amount"
        :error="error"
        :image="quest.image"
    >
        <template #header>
            <div v-if="quest.kind" class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i :class="platformIconMap[quest.kind]" class="me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <component :is="interactionComponentMap[quest.interaction]" :quest="quest" />

        <template #button>
            <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
            </b-button>

            <b-button v-else-if="!quest.isAvailable" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <BButtonGroup block class="w-100" v-else-if="!isConnected">
                <b-button variant="primary" @click="onClickConnect" :disabled="isSubmitting">
                    <template v-if="isSubmitting">
                        <b-spinner small class="me-1" />
                        Connecting platform...
                    </template>
                    <template v-else>
                        Connect <strong>{{ kinds[quest.kind] }}</strong>
                    </template>
                </b-button>
                <BButton v-if="isSubmitting" @click="onClickCancel" variant="primary" style="max-width: 40px">
                    <i class="fas fa-times text-opaque" />
                </BButton>
            </BButtonGroup>
            <b-button v-else-if="!isViewed" variant="primary" block class="w-100" @click="onClickView">
                <b-spinner v-if="isLoadingView" small></b-spinner>
                <template v-else>
                    {{ interactionLabelMap[quest.interaction] }}
                    <i class="fas fa-external-link-alt ms-1"></i>
                </template>
            </b-button>
            <b-button v-else variant="primary" block class="w-100" @click="onClickComplete" :disabled="isSubmitting">
                <template v-if="isSubmitting">
                    <b-spinner small></b-spinner>
                    Adding points...
                </template>
                <template v-else>
                    Claim <strong>{{ quest.amount }} points</strong>
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
import { useQuestStore } from '../../stores/Quest';
import { RewardConditionPlatform, QuestSocialRequirement } from '../../types/enums/rewards';
import {
    interactionComponentMap,
    getConnectionStatus,
    platformIconMap,
    tokenInteractionMap,
    AccessTokenKind,
} from '../../utils/social';
import BaseBlockquoteTwitterTweet from '../blockquote/BaseBlockquoteTwitterTweet.vue';
import BaseBlockquoteTwitterMessage from '../blockquote/BaseBlockquoteTwitterMessage.vue';
import BaseBlockquoteTwitterUser from '../blockquote/BaseBlockquoteTwitterUser.vue';
import BaseBlockquoteYoutubeChannelSubscription from '../../components/blockquote/BaseBlockquoteYoutubeChannelSubscription.vue';
import BaseBlockquoteVideo from '../../components/blockquote/BaseBlockquoteVideo.vue';
import BaseBlockquoteDiscordServerJoin from '../../components/blockquote/BaseBlockquoteDiscordServerJoin.vue';
import BaseBlockquoteDiscordMessage from '../../components/blockquote/BaseBlockquoteDiscordMessage.vue';
import BaseBlockquoteDiscordInviteUsed from '../../components/blockquote/BaseBlockquoteDiscordInviteUsed.vue';
import { interactionLabelMap } from '../../utils/social';

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
            kinds: {
                [AccessTokenKind.Google]: 'YouTube',
                [AccessTokenKind.Twitter]: 'Twitter',
                [AccessTokenKind.Discord]: 'Discord',
            } as any,
            error: '',
            isLoadingView: false,
            isViewed: false,
            isSubmitting: false,
            RewardConditionPlatform,
            QuestSocialRequirement,
            interactionComponentMap,
            platformIconMap,
            tooltipContent: 'Copy URL',
            isModalQuestEntryShown: false,
            interactionLabelMap,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        isConnected() {
            const { account } = useAccountStore();
            if (!account) return;
            const { kind, scopes } = tokenInteractionMap[this.quest.interaction];
            return getConnectionStatus(account, kind, scopes);
        },
    },
    methods: {
        onClickCancel() {
            this.isSubmitting = false;
        },
        onClickSignin() {
            this.accountStore.signin();
        },
        getContentURL(interaction: QuestSocialRequirement) {
            const map: { [i: number]: string } = {
                [QuestSocialRequirement.TwitterFollow]: `https://www.x.com/${this.quest.contentMetadata.username}`,
                [QuestSocialRequirement.TwitterLikeRetweet]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterLike]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterRetweet]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterMessage]: 'https://www.x.com',
            };
            return map[interaction];
        },
        async onClickView() {
            const url = this.getContentURL(this.quest.interaction);
            this.isLoadingView = true;

            await new Promise((resolve) => setTimeout(resolve, 500));

            window.open(url, '_blank');
            this.isLoadingView = false;
            this.isViewed = true;
        },
        async onClickComplete() {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.isModalQuestEntryShown = true;
                await this.questStore.completeSocialQuest(this.quest);
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
                const { kind, scopes } = tokenInteractionMap[this.quest.interaction];
                await this.accountStore.connect(kind, scopes);
                await this.accountStore.waitForConnectionStatus(kind, scopes);
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
