<template>
    <blockquote>
        <iframe
            width="100%"
            :id="id"
            :height="height"
            :src="`https://www.youtube.com/embed/${quest.content}?controls=0&modestbranding=1`"
        >
        </iframe>
        <hr class="my-2" />
        <p class="text-opaque mb-0">
            <i class="fas fa-info-circle me-2" />
            We will only check the last 50 likes of your connected account.
            <b-link target="_blank" :href="`https://www.youtube.com/watch?v=${quest.content}`">
                YouTube
                <i class="fas fa-external-link-alt ms-1" />
            </b-link>
        </p>
    </blockquote>
</template>

<script lang="ts">
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
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
