<template>
    <b-modal
        :id="id"
        v-model="isShown"
        centered
        hide-footer
        no-close-on-backdrop
        no-close-on-esc
        :class="{ show: isShown }"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-clock me-2"></i> This campaign has ended...</h5>
        </template>
        <p>Keep an eye on our site and stay tuned for more information about loyalty offerings.</p>
        <p>Thanks for joining us during the campaign!</p>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';

export default defineComponent({
    name: 'BaseModalCampaignExpired',
    computed: {
        ...mapStores(useAccountStore),
    },
    data() {
        return { isShown: false };
    },
    props: {
        id: { type: String, required: true },
        show: { type: Boolean },
    },
    mounted() {
        this.isShown = this.accountStore.getConfig(this.accountStore.poolId).expired;
    },
});
</script>
