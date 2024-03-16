<template>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex pb-1">
                <b-link
                    v-b-tooltip
                    v-clipboard:copy="quest.content"
                    v-clipboard:success="onCopySuccess"
                    class="position-absolute"
                    style="right: 0.5rem"
                    :title="'Do not change this text in your post! Complete the quest not faster than 10s after posting.'"
                >
                    {{ copyLabel }}
                </b-link>
                Post contains:
            </div>
            <em style="white-space: pre-wrap" v-html="quest.content" />
        </div>
    </blockquote>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { QuestSocialRequirement } from '../../types/enums/rewards';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data(): any {
        return {
            copyLabel: 'Copy Text',
            QuestSocialRequirement,
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
