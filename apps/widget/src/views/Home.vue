<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 py-5">
        <b-row>
            <b-col v-if="isLoading || !campaigns.length" class="justify-content-center d-flex">
                <b-spinner variant="light" />
            </b-col>
            <b-col v-else lg="4" xl="3" :key="key" v-for="(campaign, key) of campaigns">
                <BaseCardCampaign :campaign="campaign" @clicked="onClickCampaign" />
            </b-col>
        </b-row>
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
        this.campaigns = data.sort((a: any, b: any) => b.active - a.active).filter((c: any) => c.participants > 0);
    },
    methods: {
        onClickCampaign(campaignId: string) {
            this.isLoading = true;
            this.$router.push({ path: `/c/${campaignId}` });
        },
    },
});
</script>
