<template>
    <b-card
        bg-variant="darker"
        class="card-campaign text-white mb-4 cursor-pointer mb-2"
        style="cursor: pointer"
        header-class="p-0 card-header-campaign"
        body-class="p-0"
        footer-class="justify-content-end d-flex px-3 py-2"
        @click="$emit('clicked', campaign._id)"
    >
        <template #header>
            <div class="d-flex flex-column">
                <div
                    class="card-header-bg"
                    :style="{
                        backgroundImage: campaign.backgroundImgUrl
                            ? `url('${campaign.backgroundImgUrl}')`
                            : 'radial-gradient(var(--bs-primary), var(--bs-body-bg))',
                    }"
                ></div>
                <div class="card-header-content">
                    <b-img
                        v-if="campaign.logoImgUrl"
                        width="75"
                        height="auto"
                        class="rounded"
                        :src="campaign.logoImgUrl"
                    />

                    <b-avatar v-else class="bg-primary">
                        <i class="far fa-question-circle m-0"></i>
                    </b-avatar>

                    <div class="my-2">
                        <b-badge :key="key" v-for="(tag, key) of campaign.tags" variant="dark" class="me-1 p-2">
                            {{ tag }}
                        </b-badge>
                    </div>
                </div>
            </div>
        </template>
        <b-progress
            v-if="campaign.progress > 0"
            style="height: 10px; border-radius: 0"
            v-b-tooltip
            :title="`Expires at ${format(new Date(campaign.expiryDate), 'dd-MM-yyyy HH:mm')}`"
        >
            <b-progress-bar :value="campaign.progress" :max="100" variant="primary" />
        </b-progress>
        <div class="d-flex align-items-start p-3">
            <div class="flex-grow-1">
                <strong>
                    {{ campaign.title }}
                    <i v-if="campaign.active" class="fas fa-check-circle text-success" />
                </strong>
            </div>
            <b-badge variant="dark" class="ms-2 p-2">
                <i class="fas fa-users me-1"></i> {{ campaign.participants }}
            </b-badge>
        </div>
        <template #footer>
            <div class="flex-grow-1">
                <b-badge variant="dark" class="me-2 p-2">
                    <i class="fas fa-trophy me-1"></i> {{ campaign.quests.length }}
                </b-badge>
                <b-badge variant="dark" class="me-2 p-2">
                    <i class="fas fa-gift me-1"></i> {{ campaign.rewards.length }}
                </b-badge>
            </div>
            <b-button
                v-b-tooltip
                :title="origin"
                :href="campaign.domain"
                target="_blank"
                class="rounded-pill px-3"
                variant="primary"
                size="sm"
            >
                <i class="fas fa-link ms-0"></i>
            </b-button>
        </template>
    </b-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardCampaign',
    components: {},
    props: {
        campaign: { type: Object, required: true },
    },
    data() {
        return {
            format: format,
        };
    },
    computed: {
        origin() {
            if (!this.campaign.domain) return '';
            return new URL(this.campaign.domain).host;
        },
    },
});
</script>

<style lang="scss">
.card-campaign {
    box-shadow: 0 0 0 rgba(0, 0, 0, 0.5);

    &:hover .card-header-bg {
        filter: none;
        -webkit-filter: none;
    }
}
.card-header-campaign {
    overflow: hidden;
    position: relative;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.card-header-content {
    z-index: 1;
    text-align: center;
}
.card-header-bg {
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    background-size: cover;
    z-index: 0;
    filter: blur(8px);
    -webkit-filter: blur(8px);
    transition: 0.2s filter ease, 0.2s -webkit-filter ease;
}
</style>
