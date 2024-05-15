<template>
    <blockquote>
        You should bear the
        <strong :style="{ color: quest.contentMetadata.roleColor }">{{ quest.contentMetadata.roleName }}</strong> role
        in Discord Server: "<em>{{ quest.contentMetadata.serverName }}</em
        >".
        <div class="text-end">
            <b-link
                class="text-opaque"
                :href="quest.contentMetadata.inviteURL ? quest.contentMetadata.inviteURL : null"
                target="_blank"
            >
                Join this server
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteDiscordServerRole',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
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
