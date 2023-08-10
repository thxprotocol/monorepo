<template>
    <b-container class="d-flex flex-column align-items-center justify-content-center h-100">
        <b-card>
            <h2 class="mb-3">🚀 New features!</h2>
            <p class="lead"></p>
            <p>Please give us a moment while we run some maintenance.</p>
            <p>THX🙏🏻</p>
        </b-card>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseCardCampaign from '../components/BaseCardCampaign.vue';
import { API_URL } from '../config/secrets';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardCampaign,
    },
    data(): any {
        return {
            isLoading: false,
            campaigns: [],
        };
    },
    async mounted() {
        const res = await fetch(API_URL + '/v1/pools/public');
        const data = await res.json();
        this.campaigns = data.filter((a: any) => a).sort((a: any, b: any) => b.participants - a.participants);
    },
    methods: {
        onClickCampaign(campaignId: string) {
            this.isLoading = true;
            this.$router.push({ path: `/c/${campaignId}`, query: { origin: window.location.origin } });
        },
    },
});
</script>
