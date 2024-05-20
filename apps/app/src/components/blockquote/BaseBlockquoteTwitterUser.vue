<template>
    <blockquote v-if="quest.contentMetadata">
        <div class="d-flex align-items-center">
            <b-avatar :src="quest.contentMetadata.profileImgUrl" class="me-2" />
            <div>
                <div>
                    <strong>{{ quest.contentMetadata.name }}</strong>
                </div>
                <span class="text-muted">@{{ quest.contentMetadata.username }}</span>
            </div>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteTweet',
    props: {
        quest: {
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
