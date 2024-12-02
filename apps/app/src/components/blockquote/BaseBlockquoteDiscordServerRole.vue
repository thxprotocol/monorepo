<template>
    <blockquote>
        You should bear the
        <strong :style="{ color: quest.contentMetadata.roleColor }">{{ quest.contentMetadata.roleName }}</strong> role
        in Discord Server: "<em>{{ quest.contentMetadata.serverName }}</em
        >".
        <div class="text-end">
            <b-link class="text-opaque" href="#" @click.prevent="openPopup(quest.contentMetadata.inviteURL)">
                Join this server
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { popup } from '@thxnetwork/app/utils/popup';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteDiscordServerRole',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    methods: {
        openPopup(link: string) {
            if (link) {
                popup.open(link);
            } else {
                console.warn('No invite URL provided');
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
