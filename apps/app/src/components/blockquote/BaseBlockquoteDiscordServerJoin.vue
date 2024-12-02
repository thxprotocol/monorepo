<template>
    <blockquote>
        <div class="text-end">
            <b-link class="text-opaque" href="#" @click.prevent="handlePopupOpen">
                Join Discord server
                <i class="fas fa-external-link-alt"></i>
            </b-link>
        </div>
    </blockquote>
</template>

<script lang="ts">
import { popup } from '@thxnetwork/app/utils/popup';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseBlockquoteDiscordServerJoin',
    props: {
        quest: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    methods: {
        handlePopupOpen() {
            if (this.quest.contentMetadata.inviteURL) {
                popup.open(this.quest.contentMetadata.inviteURL);
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
