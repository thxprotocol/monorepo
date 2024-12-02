<template>
    <blockquote v-if="post">
        <b-link
            class="fw-bold text-accent"
            href="#"
            @click.prevent="openPopup(`https://www.twitter.com/${post.username}`)"
        >
            @{{ post.username }}
        </b-link>
        -
        <span v-if="post.text">
            {{ post.text.substring(0, 255)
            }}<template v-if="post.text.length > 255" class="text-accent"> ... </template>
        </span>
        <b-link v-if="url" href="#" class="text-accent" @click.prevent="openPopup(url)"> View post </b-link>
    </blockquote>
    <b-alert v-else variant="primary" class="p-2">
        <i class="fas fa-info-circle me-1"></i>
        Post information not available
    </b-alert>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { QuestSocialRequirement } from '../../types/enums/rewards';
import { popup } from '@thxnetwork/app/utils/popup';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        post() {
            return this.quest.contentMetadata;
        },
        url() {
            if (!this.quest.content) return '';
            return this.post.url || this.getChannelActionURL(this.quest.interaction, this.quest.content);
        },
    },
    methods: {
        getChannelActionURL(interaction: QuestSocialRequirement, content: string) {
            switch (interaction) {
                case QuestSocialRequirement.TwitterRetweet:
                    return `https://www.x.com/twitter/status/${content}`;
                default:
                    return '';
            }
        },
        openPopup(link: string) {
            if (link) {
                popup.open(link);
            } else {
                console.warn('No link provided');
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
