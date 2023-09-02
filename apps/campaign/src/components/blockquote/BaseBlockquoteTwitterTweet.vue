<template>
    <blockquote>
        <b-link
            target="_blank"
            class="fw-bold text-accent"
            :href="`https://www.twitter.com/${reward.contentMetadata.username}`"
        >
            @{{ reward.contentMetadata.username }}
        </b-link>
        -
        <span> {{ reward.contentMetadata.text.substring(0, 110) }}</span>
        <b-link
            v-if="reward.contentMetadata.text.length > 110"
            :href="reward.contentMetadata.url"
            target="_blank"
            class="text-accent"
        >
            ...
        </b-link>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link :href="reward.contentMetadata.url" target="_blank" class="text-opaque ms-auto">
                {{ interactionLabel[reward.interaction] }}
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useRewardStore } from '../../stores/Reward';
import { RewardConditionInteraction } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        reward: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data: function (): any {
        return {
            interactionLabel: {
                [RewardConditionInteraction.TwitterLike]: 'Like this tweet',
                [RewardConditionInteraction.TwitterRetweet]: 'Retweet this tweet',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        content() {
            if (!this.interactionLabel[this.reward.interaction] || !this.reward.content) return;
            return this.getChannelActionURL(this.reward.interaction, this.reward.content);
        },
    },
    methods: {
        getChannelActionURL(interaction: RewardConditionInteraction, content: string) {
            switch (interaction) {
                case RewardConditionInteraction.TwitterLike:
                    return { url: `https://www.twitter.com/twitter/status/${content}` };
                case RewardConditionInteraction.TwitterRetweet:
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
