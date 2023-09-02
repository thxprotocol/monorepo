<template>
    <blockquote>
        <div class="d-flex align-items-center">
            <b-avatar :src="reward.contentMetadata.profileImgUrl" class="me-2" />
            <div>
                <div>
                    <strong>{{ reward.contentMetadata.name }}</strong>
                </div>
                <span class="text-muted">@{{ reward.contentMetadata.username }}</span>
            </div>
        </div>
        <hr class="my-2" />
        <div class="text-center card-text">
            <b-link
                :href="`https://twitter.com/${reward.contentMetadata.username}`"
                target="_blank"
                class="text-opaque ms-auto"
            >
                Follow this Twitter account
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
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
