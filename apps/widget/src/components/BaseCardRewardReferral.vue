<template>
    <b-card bg-variant="purple-dark" class="m-2">
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <b-input-group v-if="accountStore.isAuthenticated">
            <b-form-input :model-value="referralUrl" />
            <b-input-group-append>
                <b-button
                    v-b-tooltip.hover.v-success.left
                    tooltip-left
                    :title="tooltipContent"
                    size="sm"
                    variant="primary"
                    v-clipboard:copy="referralUrl"
                    v-clipboard:success="() => (tooltipContent = 'URL copied!')"
                >
                    <i class="fas fa-clipboard px-2"></i>
                </b-button>
            </b-input-group-append>
        </b-input-group>

        <b-button v-else variant="primary" block class="w-100" @click="accountStore.api.signin()">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';

export default defineComponent({
    name: 'BaseCardRewardReferral',
    props: {
        reward: {
            type: Object as PropType<TReferralReward>,
            required: true,
        },
    },
    data: function () {
        return { tooltipContent: 'Copy URL', referralUrl: `https://xyz.com?referral=${this.reward.uuid}` };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
    methods: {
        onClick: function () {
            if (this.accountStore.isAuthenticated) {
                alert('authenticated');
            } else {
                alert('not authenticated');
            }
        },
    },
});
</script>
