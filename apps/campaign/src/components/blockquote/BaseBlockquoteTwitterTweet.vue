<template>
    <blockquote>
        <b-link
            target="_blank"
            class="fw-bold text-accent"
            :href="`https://www.twitter.com/${quest.contentMetadata.username}`"
        >
            @{{ quest.contentMetadata.username }}
        </b-link>
        -
        <span v-if="quest.contentMetadata.text"> {{ quest.contentMetadata.text.substring(0, 110) }}</span>
        <b-link
            v-if="quest.contentMetadata.text.length > 110"
            :href="quest.contentMetadata.url"
            target="_blank"
            class="text-accent"
        >
            ...
        </b-link>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link :href="quest.contentMetadata.url" target="_blank" class="text-opaque ms-auto">
                {{ interactionLabel[quest.interaction] }}
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { QuestConditionInteraction } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data: function (): any {
        return {
            interactionLabel: {
                [QuestConditionInteraction.TwitterLike]: 'Like this post',
                [QuestConditionInteraction.TwitterRetweet]: 'Repost this post',
                [QuestConditionInteraction.TwitterLikeRetweet]: 'Repost & Like this post',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        content() {
            if (!this.interactionLabel[this.quest.interaction] || !this.quest.content) return;
            return this.getChannelActionURL(this.quest.interaction, this.quest.content);
        },
    },
    methods: {
        getChannelActionURL(interaction: QuestConditionInteraction, content: string) {
            switch (interaction) {
                case QuestConditionInteraction.TwitterLike:
                case QuestConditionInteraction.TwitterRetweet:
                case QuestConditionInteraction.TwitterLikeRetweet:
                    return { url: `https://www.twitter.com/twitter/status/${content}` };
                default:
                    return '';
            }
        },
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
