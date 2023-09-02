<template>
    <blockquote>
        <div class="text-center">
            <b-link :href="`https://youtube.com/channel/${reward.content}`" target="_blank" class="text-muted ms-auto">
                Subscribe to this Youtube channel
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteYoutubeChannelSubscription',
    props: {
        reward: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
