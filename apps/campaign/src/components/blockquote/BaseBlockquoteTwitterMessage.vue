<template>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex pb-1">
                <b-link
                    class="position-absolute"
                    style="right: 0.5rem"
                    v-b-tooltip
                    :title="'Do not change this text in your post! Complete the quest not faster than 10s after posting.'"
                    v-clipboard:copy="reward.content"
                    v-clipboard:success="onCopySuccess"
                >
                    {{ copyLabel }}
                </b-link>
                Post contains:
            </div>
            <em style="white-space: pre-wrap" v-html="reward.content" />
        </div>
    </blockquote>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
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
        ...mapStores(useQuestStore),
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
