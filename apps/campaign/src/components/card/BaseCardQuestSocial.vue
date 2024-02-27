<template>
    <BaseCardQuest
        @modal-close="isModalQuestEntryShown = false"
        :quest="quest"
        :id="quest._id"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
    >
        <component :is="interactionComponentMap[quest.interaction]" :quest="quest" />

        <template #button>
            <BButtonGroup block class="w-100" v-if="!isConnected">
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
            <b-button
                v-else-if="contentURL && !isViewed"
                @click="onClickView"
                variant="primary"
                block
                class="w-100"
                :disabled="isLoadingView"
            >
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
    </BaseCardQuest>
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
        contentURL() {
            const map: { [i: number]: string } = {
                [QuestSocialRequirement.TwitterFollow]: `https://www.x.com/${this.quest.contentMetadata.username}`,
                [QuestSocialRequirement.TwitterLikeRetweet]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterLike]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterRetweet]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterMessage]: 'https://www.x.com',
                [QuestSocialRequirement.YouTubeLike]: `https://www.youtube.com/watch?v=${this.quest.content}`,
                [QuestSocialRequirement.YouTubeSubscribe]: `https://www.youtube.com/channel/${this.quest.content}`,
                [QuestSocialRequirement.DiscordGuildJoined]: this.quest.contentMetadata.inviteURL,
                [QuestSocialRequirement.DiscordMessage]: '',
            };
            return map[this.quest.interaction];
        },
    },
    methods: {
        onClickCancel() {
            this.isSubmitting = false;
        },
        async onClickView() {
            this.isLoadingView = true;

            await new Promise((resolve) => setTimeout(resolve, 500));

            window.open(this.contentURL, '_blank');

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
