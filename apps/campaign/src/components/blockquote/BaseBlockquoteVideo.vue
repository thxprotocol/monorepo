<template>
    <blockquote>
        <iframe
            width="100%"
            :id="id"
            :height="height"
            :src="`https://www.youtube.com/embed/${reward.contentMetadata.videoId}?controls=0&modestbranding=1`"
        >
        </iframe>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link
                :href="`https://youtu.be/${reward.contentMetadata.videoId}`"
                target="_blank"
                class="text-opaque ms-auto"
            >
                Like this Youtube video
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteVideo',
    props: {
        reward: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    computed: {
        id() {
            return `video-iframe-${this.reward._id}`;
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
