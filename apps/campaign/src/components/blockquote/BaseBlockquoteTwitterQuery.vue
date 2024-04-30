<template>
    <div class="mb-3">
        <blockquote v-if="operators.to && operators.to.length" class="mb-1">
            <div class="card-text ps-2 position-relative">
                <div class="d-flex text-opaque pb-1">Your post is a reply to:</div>
                <em v-for="to of operators.to">@{{ to }}</em>
            </div>
        </blockquote>
        <template v-if="operators.text && operators.text.length">
            <blockquote v-for="text of operators.text" class="mb-1">
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
        </template>
        <blockquote v-if="operators.hashtags && operators.hashtags.length" class="mb-1">
            <div class="card-text ps-2 position-relative">
                <div class="d-flex text-opaque pb-1">Your post contains hashtags:</div>
                <em v-for="hashtag of operators.hashtags">#{{ hashtag }}</em>
            </div>
        </blockquote>
        <blockquote v-if="operators.mentions && operators.mentions.length" class="mb-1">
            <div class="card-text ps-2 position-relative">
                <div class="d-flex text-opaque pb-1">Your post mentions:</div>
                <em v-for="mention of operators.mentions">@{{ mention }}</em>
            </div>
        </blockquote>
        <blockquote v-if="operators.url && operators.url.length" class="mb-1">
            <div class="card-text ps-2 position-relative">
                <div class="d-flex text-opaque pb-1">Your post contains URL:</div>
                <span v-for="(url, index) of operators.url">
                    <code> https://{{ url }} </code>
                    <span v-if="index === operators.url.length">,</span>
                </span>
            </div>
        </blockquote>
        <blockquote v-if="operators.media !== 'ignore'" class="mb-1">
            <div class="card-text ps-2 position-relative">
                <div class="d-flex text-opaque pb-1">Required media:</div>
                <em v-if="operators.media === 'has:media'">A video and/or image</em>
                <em v-if="operators.media === 'has:image'">An image</em>
                <em v-if="operators.media === 'has:video'">A video</em>
            </div>
        </blockquote>
    </div>
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
        operators() {
            return this.quest.contentMetadata.operators;
        },
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
