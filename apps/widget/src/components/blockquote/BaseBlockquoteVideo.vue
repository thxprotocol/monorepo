<template>
    <blockquote>
        <iframe
            :width="videoWidth"
            :height="videoHeight"
            :src="`https://www.youtube.com/embed/${reward.contentMetadata.videoId}?controls=0&modestbranding=1`"
        >
        </iframe>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link :href="`https://youtu.be/${content}`" target="_blank" class="text-muted ms-auto">
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
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    data: function (): any {
        return {
            videoWidth: 315,
            videoHeight: 200,
        };
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
