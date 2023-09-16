<template>
    <b-modal
        class="modal-campaign-domain"
        :title="campaign.title"
        v-model="isShown"
        @hidden="$emit('hidden', false)"
        centered
        hide-footer
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ campaign.title }}</h5>
            <b-link class="btn-close" @click="$emit('hidden', false)">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <p>
            You will be redirected you to the campaign domain: <br />
            <code>{{ campaign.domain }}</code>
        </p>
        <b-button @click="onClickContinueCampaign" variant="primary" class="w-100">
            Continue
            <i class="fas fa-chevron-right ms-1" />
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../stores/Account';
import { track } from '@thxnetwork/mixpanel';

export default defineComponent({
    name: 'BaseModalERC20Transfer',
    data() {
        return { isShown: false };
    },
    props: {
        campaign: {
            type: Object,
            required: true,
        },
        show: Boolean,
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickContinueCampaign() {
            const { account } = useAccountStore();
            track('UserVisits', [
                account?.sub || '',
                'campaign discovery',
                { origin: this.campaign.domain, poolId: this.campaign._id },
            ]);
            window.open(this.campaign.domain, '_blank');
            this.$emit('hidden', false);
        },
    },
});
</script>
