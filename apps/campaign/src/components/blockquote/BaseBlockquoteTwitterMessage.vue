<template>
    <blockquote>
        <div class="card-text ps-2">
            {{ interactionLabel[reward.interaction] }}<br />
            <em>"{{ content }}" (exact match)</em>
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
                [RewardConditionInteraction.TwitterMessage]: 'Tweet contains: ',
            },
            tooltipContent: 'Copy URL',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        content() {
            if (!this.interactionLabel[this.reward.interaction] || !this.reward.content) return;
            return this.reward.content;
        },
    },
    methods: {},
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
