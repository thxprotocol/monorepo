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
        <!-- <component :is="interactionComponentMap[quest.interaction]" :quest="quest" /> -->

        <div v-if="error && error.length > 0" variant="danger" class="p-2 alert alert-primary alert-wrap">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </div>

        <template #button>
            <button
                class="w-100"
                block
                :onclick="buttonAction"
                :class="{
                    'locked-btn': isSubmitting,
                    'btn-primary': !isSubmitting,
                }"
            >
                <b-spinner v-if="isSubmitting" small />
                <template v-else>
                    {{ buttonLabel }}
                </template>
            </button>
            <!-- <BButtonGroup v-if="!isConnected" block class="w-100">
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
                    <i class="fas fa-times text-opaque m-0" />
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
            </b-button> -->
        </template>
    </BaseCardQuest>
    <b-modal v-model="showQuestModal" centered hide-footer>
        <template #header>
            <h5 class="modal-title">{{ groupTitle }}</h5>
            <b-link class="btn-close" @click.prevent="showQuestModal = false">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <!-- Component inside the modal -->
        <div class="d-flex justify-content-center mb-3">
            <img v-if="quest.image" :src="quest.image" :alt="quest.title" style="border-radius: 10px" />
        </div>
        <component :is="interactionComponentMap[quest.interaction]" :quest="quest" />
        <div class="mb-5">
            <p>
                You can earn
                <span class="text-accent"
                    ><strong>{{ quest.amount }}</strong></span
                >
                points
            </p>
        </div>
        <div v-if="error" variant="danger" class="p-2"><i class="fas fa-exclamation-circle me-1"></i> {{ error }}</div>

        <div class="mt-3">
            <b-button variant="primary" class="w-100" block :disabled="isSubmitting" @click="buttonAction">
                <b-spinner v-if="isSubmitting" small />
                <template v-else>
                    {{ buttonLabel }}
                </template>
            </b-button>
            <!-- <BButtonGroup v-if="!isConnected" block class="w-100">
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
                    <i class="fas fa-times text-opaque m-0" />
                </BButton>
            </BButtonGroup> -->
            <!-- <b-button v-else variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClickValidate">
                <b-spinner v-if="isSubmitting" small />
                <template v-else>Validate Quest</template>
            </b-button> -->

            <!-- <b-button
                v-else-if="!isValidated"
                variant="primary"
                block
                class="w-100"
                :disabled="isSubmitting"
                @click="onClickValidate"
            >
                <b-spinner v-if="isSubmitting" small />
                <template v-else> Validate </template>
            </b-button>
            <b-button v-else variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClickComplete">
                <b-spinner v-if="isSubmitting" small />
                <template v-else-if="quest.amount">
                    Claim <strong>{{ quest.amount }} points</strong>
                </template>
                <template v-else>Complete Quest</template>
            </b-button> -->

            <!-- <b-button
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
            </b-button> -->
        </div>
    </b-modal>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType, ref } from 'vue';
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
        groupTitle: {
            type: String,
            required: false,
        },
    },
    data() {
        return {
            kinds: {
                [AccessTokenKind.Google]: 'YouTube',
                [AccessTokenKind.Twitter]: 'X',
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
            showQuestModal: false,
            isValidated: false,
            buttonLabel: this.isConnected ? 'Validate' : 'Connect',
            buttonAction: this.isConnected ? this.onClickValidate : this.onClickConnect,
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
                [QuestSocialRequirement.YouTubeLike]: `https://www.youtube.com/watch?v=${this.quest.content}`,
                [QuestSocialRequirement.YouTubeSubscribe]: `https://www.youtube.com/channel/${this.quest.content}`,
                [QuestSocialRequirement.TwitterReply]: `https://www.x.com/intent/tweet?in_reply_to=${this.quest.content}`,
                [QuestSocialRequirement.TwitterFollow]: `https://www.x.com/${this.quest.contentMetadata.username}`,
                [QuestSocialRequirement.TwitterRetweet]: `https://twitter.com/intent/retweet?tweet_id=${this.quest.content}`,
                [QuestSocialRequirement.TwitterQuery]: this.queryToURL(this.quest),
                [QuestSocialRequirement.DiscordGuildJoined]: this.quest.contentMetadata.inviteURL,
                [QuestSocialRequirement.DiscordGuildRole]: '',
                [QuestSocialRequirement.DiscordMessage]: '',
            };
            return map[this.quest.interaction];
        },
    },
    watch: {
        isConnected(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.initializeButtonState();
            }
        },
    },
    mounted() {
        this.initializeButtonState();
        console.log('questy:', this.quest);
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

            this.buttonLabel = 'Validate';
            this.buttonAction = this.onClickValidate;

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
        async onClickDisconnect() {
            try {
                this.error = '';
                this.isSubmitting = true;

                const { kind } = tokenInteractionMap[this.quest.interaction];
                await this.accountStore.disconnect(kind);
            } catch (error) {
                this.error = 'Could not disconnect platform.';
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        async onClickValidate() {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.isValidated = false;

                const validationResult = await this.questStore.validateQuest(this.quest);

                if (validationResult?.result) {
                    this.isValidated = true;
                    this.buttonLabel = `Claim ${this.quest.amount} points`;
                    this.buttonAction = this.onClickComplete;
                } else {
                    this.error = validationResult.reason || 'Validation failed.';
                    this.buttonLabel = interactionLabelMap[this.quest.interaction];
                    this.buttonAction = this.onClickView;
                }
            } catch (err) {
                await this.onClickDisconnect();
                console.error(err);
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
            } catch (error) {
                // this.error = 'Could not connect platform.';
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        initializeButtonState() {
            if (this.isConnected) {
                if (this.quest.interaction === 4) {
                    this.buttonLabel = interactionLabelMap[this.quest.interaction];
                    this.buttonAction = this.onClickView;
                } else {
                    this.buttonLabel = 'Validate';
                    this.buttonAction = this.onClickValidate;
                }
            } else {
                this.buttonLabel = `Connect ${this.kinds[this.quest.kind]}`;
                this.buttonAction = this.onClickConnect;
            }
        },
    },
});
</script>
<style lang="scss">
.alert-wrap {
    position: absolute;
    top: -130px;
    width: calc(100% - 30px);
    border-radius: 10px;
}
</style>
