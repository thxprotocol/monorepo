<template>
    <blockquote>
        <div class="text-center">
            <b-link :href="content.url" target="_blank" class="text-muted ms-auto">
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
import { RewardConditionPlatform, RewardConditionInteraction } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    data: function (): any {
        return {
            RewardConditionPlatform,
            RewardConditionInteraction,
            interactionLabel: {
                [RewardConditionInteraction.YouTubeSubscribe]: 'Subscribe to this Youtube channel',
            },
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
                case RewardConditionInteraction.YouTubeSubscribe:
                    return { url: `https://youtube.com/channel/${content}` };
                default:
                    return { url: '' };
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
