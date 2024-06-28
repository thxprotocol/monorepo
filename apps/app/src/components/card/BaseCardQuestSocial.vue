<template>
    <BaseCardQuest
        :id="quest._id"
        :quest="quest"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
        @modal-close="isModalQuestEntryShown = false"
    >
        <component :is="interactionComponentMap[quest.interaction]" :quest="quest" />

        <template #button>
            <BButtonGroup v-if="!isConnected" block class="w-100">
                <b-button variant="primary" :disabled="isSubmitting" @click="onClickConnect">
                    <template v-if="isSubmitting">
                        <b-spinner small class="me-1" />
                        Connecting platform...
                    </template>
                    <template v-else>
                        Connect <strong>{{ kinds[quest.kind] }}</strong>
                    </template>
                </b-button>
                <BButton v-if="isSubmitting" variant="primary" style="max-width: 40px" @click="onClickCancel">
                    <i class="fas fa-times text-opaque" />
                </BButton>
            </BButtonGroup>
            <b-button
                v-else-if="contentURL && !isViewed"
                variant="primary"
                block
                class="w-100"
                :disabled="isLoadingView"
                @click="onClickView"
            >
                <b-spinner v-if="isLoadingView" small></b-spinner>
                <template v-else>
                    {{ interactionLabelMap[quest.interaction] }}
                    <i class="fas fa-external-link-alt ms-1"></i>
                </template>
            </b-button>
            <b-button v-else variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClickComplete">
                <b-spinner v-if="isSubmitting" small />
                <template v-else-if="quest.amount">
                    Claim <strong>{{ quest.amount }} points</strong>
                </template>
                <template v-else>Complete Quest</template>
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
import { QuestSocialRequirement } from '../../types/enums/rewards';
import {
    interactionComponentMap,
    getConnectedUser,
    platformIconMap,
    tokenInteractionMap,
    AccessTokenKind,
} from '../../utils/social';
import BaseBlockquoteTwitterTweet from '../blockquote/BaseBlockquoteTwitterTweet.vue';
import BaseBlockquoteTwitterQuery from '../blockquote/BaseBlockquoteTwitterQuery.vue';
import BaseBlockquoteTwitterUser from '../blockquote/BaseBlockquoteTwitterUser.vue';
import BaseBlockquoteYoutubeChannelSubscription from '../../components/blockquote/BaseBlockquoteYoutubeChannelSubscription.vue';
import BaseBlockquoteVideo from '../../components/blockquote/BaseBlockquoteVideo.vue';
import BaseBlockquoteDiscordServerJoin from '../../components/blockquote/BaseBlockquoteDiscordServerJoin.vue';
import BaseBlockquoteDiscordServerRole from '../../components/blockquote/BaseBlockquoteDiscordServerRole.vue';
import BaseBlockquoteDiscordMessage from '../../components/blockquote/BaseBlockquoteDiscordMessage.vue';
import BaseBlockquoteDiscordInviteUsed from '../../components/blockquote/BaseBlockquoteDiscordInviteUsed.vue';
import { interactionLabelMap } from '../../utils/social';

export default defineComponent({
    name: 'BaseCardQuestSocial',
    components: {
        BaseBlockquoteYoutubeChannelSubscription,
        BaseBlockquoteVideo,
        BaseBlockquoteTwitterTweet,
        BaseBlockquoteTwitterQuery,
        BaseBlockquoteTwitterUser,
        BaseBlockquoteDiscordServerJoin,
        BaseBlockquoteDiscordServerRole,
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
            return getConnectedUser(account, kind, scopes);
        },
        contentURL() {
            const map: { [i: number]: string } = {
                [QuestSocialRequirement.TwitterFollow]: `https://www.x.com/${this.quest.contentMetadata.username}`,
                [QuestSocialRequirement.TwitterRetweet]: this.quest.contentMetadata.url,
                [QuestSocialRequirement.TwitterQuery]: this.queryToURL(this.quest),
                [QuestSocialRequirement.YouTubeLike]: `https://www.youtube.com/watch?v=${this.quest.content}`,
                [QuestSocialRequirement.YouTubeSubscribe]: `https://www.youtube.com/channel/${this.quest.content}`,
                [QuestSocialRequirement.DiscordGuildJoined]: this.quest.contentMetadata.inviteURL,
                [QuestSocialRequirement.DiscordGuildRole]: '',
                [QuestSocialRequirement.DiscordMessage]: '',
            };
            return map[this.quest.interaction];
        },
    },
    methods: {
        queryToURL(quest: TQuestSocial) {
            if (!quest.contentMetadata || !quest.contentMetadata.operators) return 'https://x.com';
            const { mentions, text, hashtags, url } = quest.contentMetadata.operators;
            const intentURL = new URL('https://x.com/intent/tweet');
            const message = mentions.length ? mentions.map((m) => `@${m}`).join(' ') + ` ${text}` : text;
            intentURL.searchParams.append('text', message);
            intentURL.searchParams.append('hashtags', hashtags.join(','));
            if (url.length) {
                intentURL.searchParams.append('url', url[0]);
            }
            return intentURL.toString();
        },
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
                await this.questStore.completeQuest(this.quest);
                this.isModalQuestEntryShown = true;
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
