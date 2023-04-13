<template>
    modalCampaignExpired
    <b-modal :id="id" :v-model="isShown" no-close-on-backdrop centered no-close-on-esc class="show">
        <template #header>
            <h5 class="modal-title">This campaign has ended.</h5>
        </template>
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
        id: {
            type: String,
            required: true,
        },
        show: {
            type: Boolean,
            required: true,
        },
    },
    watch: {
        show(value) {
            console.log('this.isShown', this.isShown);
            this.isShown = value; //this.accountStore.getConfig(this.accountStore.poolId).expired;
        },
    },
});
</script>
