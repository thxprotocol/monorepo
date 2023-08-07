<template>
    <blockquote>
        <div class="text-center">
            <b-link
                class="text-muted ms-auto"
                :href="reward.contentMetadata.inviteURL ? reward.contentMetadata.inviteURL : null"
                target="_blank"
            >
                At least <strong>{{ reward.contentMetadata.treshold }}</strong> users are joined through this invite
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteDiscordServerJoin',
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    methods: {},
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
