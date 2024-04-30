<template>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex text-opaque pb-1">Your post is a reply to:</div>
            <em v-for="to of quest.contentMetadata.operators.to">@{{ to }}</em>
        </div>
    </blockquote>
    <blockquote v-for="text of quest.contentMetadata.operators.text">
        <div class="card-text ps-2 position-relative">
            <div class="d-flex pb-1">
                <b-link
                    v-b-tooltip
                    v-clipboard:copy="text"
                    v-clipboard:success="onCopySuccess"
                    class="position-absolute"
                    style="right: 0.5rem"
                    :title="'Do not change this text in your post! Complete the quest not faster than 10s after posting.'"
                >
                    {{ copyLabel }}
                </b-link>
                <span class="text-opaque"> Your post contains: </span>
            </div>
            <em style="white-space: pre-wrap" v-html="text" />
        </div>
    </blockquote>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex text-opaque pb-1">Your post contains hashtags:</div>
            <em v-for="hashtag of quest.contentMetadata.operators.hashtags">#{{ hashtag }}</em>
        </div>
    </blockquote>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex text-opaque pb-1">Your post mentions:</div>
            <em v-for="mention of quest.contentMetadata.operators.mentions">@{{ mention }}</em>
        </div>
    </blockquote>
    <blockquote>
        <div class="card-text ps-2 position-relative">
            <div class="d-flex text-opaque pb-1">Your post contains URL:</div>
            <span v-for="(url, index) of quest.contentMetadata.operators.url">
                <code> https://{{ url }} </code>
                <span v-if="index === quest.contentMetadata.operators.url.length">,</span>
            </span>
        </div>
    </blockquote>
    <blockquote v-if="quest.contentMetadata.operators.media !== 'ignore'">
        <div class="card-text ps-2 position-relative">
            <div class="d-flex text-opaque pb-1">Your post contains:</div>
            <em>{{ quest.contentMetadata.operators.media }}</em>
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
