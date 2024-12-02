<template>
    <blockquote>
        <div class="text-center">
            <b-link class="text-opaque ms-auto" href="#" @click.prevent="openPopup(quest.contentMetadata.inviteURL)">
                At least <strong>{{ quest.contentMetadata.treshold }}</strong> users are joined through this invite
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
