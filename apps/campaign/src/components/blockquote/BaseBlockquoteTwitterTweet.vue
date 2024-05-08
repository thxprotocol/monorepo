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
        <span v-if="quest.contentMetadata.text"> {{ quest.contentMetadata.text.substring(0, 255) }}</span>
        <b-link
            v-if="quest.contentMetadata.text.length > 255"
            :href="quest.contentMetadata.url"
            target="_blank"
            class="text-accent"
        >
            ...
        </b-link>
    </blockquote>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { QuestSocialRequirement } from '../../types/enums/rewards';
import { interactionLabelMap } from '../../utils/social';

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
            interactionLabelMap,
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
        getChannelActionURL(interaction: QuestSocialRequirement, content: string) {
            switch (interaction) {
                case QuestSocialRequirement.TwitterLike:
                case QuestSocialRequirement.TwitterRetweet:
                case QuestSocialRequirement.TwitterLikeRetweet:
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
