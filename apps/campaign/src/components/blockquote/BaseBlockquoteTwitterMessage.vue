<template>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex pb-1">
                <b-link
                    class="position-absolute"
                    style="right: 0.5rem"
                    v-b-tooltip
                    :title="'Do not change this text in your post! Complete the quest right after posting as we only check requirements for your last post on X.'"
                    v-clipboard:copy="reward.content"
                    v-clipboard:success="onCopySuccess"
                >
                    {{ copyLabel }}
                </b-link>
                Post contains:
            </div>
            <em>{{ reward.content }}</em>
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
    data(): any {
        return {
            copyLabel: 'Copy Text',
            RewardConditionInteraction,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
    methods: {
        onCopySuccess() {
            this.copyLabel = 'Copied!';
        },
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
