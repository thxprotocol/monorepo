<template>
    <blockquote>
        <iframe
            :id="id"
            width="100%"
            :height="height"
            :src="`https://www.youtube.com/embed/${quest.content}?controls=0&modestbranding=1`"
        >
        </iframe>
        <hr class="my-2" />
        <p class="text-opaque mb-0">
            <i class="fas fa-info-circle me-2" />
            We will only check the last 50 likes of your connected account.
            <b-link href="#" @click.prevent="openPopup(`https://www.youtube.com/watch?v=${quest.content}`)">
                YouTube
                <i class="fas fa-external-link-alt ms-1" />
            </b-link>
        </p>
    </blockquote>
</template>

<script lang="ts">
import { popup } from '@thxnetwork/app/utils/popup';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteVideo',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    computed: {
        id() {
            return `video-iframe-${this.quest._id}`;
        },
        height() {
            const element = document.getElementById(this.id);
            return element ? (element.clientWidth / 16) * 9 : 200;
        },
    },
    methods: {
        openPopup(link: string) {
            if (link) {
                popup.open(link);
            } else {
                console.warn('No video URL provided');
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
