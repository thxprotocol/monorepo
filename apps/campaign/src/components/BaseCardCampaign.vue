<template>
    <b-card
        class="card-campaign text-white mb-4 cursor-pointer mb-2"
        style="cursor: pointer"
        header-class="p-0 card-header-campaign"
        body-class="p-0"
        footer-class="justify-content-end d-flex px-3 py-2"
        @click.delegate="onClickCampaign"
    >
        <BCardImg
            v-if="campaign.backgroundImgUrl"
            class="d-none"
            :src="campaign.backgroundImgUrl"
            lazy
            v-on:decode.native="onDecode"
        />
        <template #header>
            <div
                class="d-flex flex-column align-items-center justify-content-center card-header-bg"
                :style="{
                    backgroundImage:
                        isLazyLoaded && campaign.backgroundImgUrl
                            ? `url('${campaign.backgroundImgUrl}')`
                            : 'radial-gradient(var(--bs-primary), var(--bs-body-bg))',
                }"
            ></div>
            <div class="card-header-content">
                <b-img v-if="campaign.logoImgUrl" width="75" height="auto" class="rounded" :src="campaign.logoImgUrl" />

                <b-avatar v-else class="bg-primary">
                    <i class="far fa-question-circle m-0"></i>
                </b-avatar>

                <div class="my-2">
                    <b-badge variant="dark" class="p-2">
                        <i class="fas fa-users me-1"></i> {{ campaign.participants }}
                    </b-badge>
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
        </div>
        <BaseModalCampaignDomain
            :show="isModalCampaignDomainShown"
            :campaign="campaign"
            @hidden="isModalCampaignDomainShown = false"
        />
        <b-modal
            class="modal-campaign-iframe"
            :title="campaign.title"
            size="xl"
            v-model="isModalCampaignFsShown"
            @show="onShow"
            @hidden="onHidden"
            centered
            body-class="p-0"
            hide-footer
        >
            <template #header>
                <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ campaign.title }}</h5>
                <b-link class="btn-close" @click="isModalCampaignFsShown = false">
                    <i class="fas fa-times"></i>
                </b-link>
            </template>
            <iframe
                v-if="isModalCampaignFsShown"
                width="100%"
                class="m-0"
                style="height: 90vh"
                :src="campaignUrl"
            ></iframe>
        </b-modal>
        <template #footer>
            <div class="flex-grow-1">
                <b-badge variant="dark" class="me-2 p-2">
                    <i class="fas fa-trophy me-1"></i> {{ campaign.quests }}
                </b-badge>
                <b-badge variant="dark" class="me-2 p-2">
                    <i class="fas fa-gift me-1"></i> {{ campaign.rewards }}
                </b-badge>
            </div>
            <b-button
                @click.stop="isModalCampaignDomainShown = true"
                class="rounded-pill px-3"
                variant="primary"
                size="sm"
            >
                <i class="fas fa-expand ms-0"></i>
            </b-button>
        </template>
    </b-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { format } from 'date-fns';
import { WIDGET_URL } from '../config/secrets';
import BaseModalCampaignDomain from './BaseModalCampaignDomain.vue';

export default defineComponent({
    name: 'BaseCardCampaign',
    components: { BaseModalCampaignDomain },
    props: {
        campaign: { type: Object, required: true },
    },
    data() {
        return {
            isLazyLoaded: false,
            isModalCampaignDomainShown: false,
            isModalCampaignFsShown: false,
            format,
            scrollY: window.scrollY,
        };
    },
    computed: {
        onDecode() {
            this.isLazyLoaded = true;
        },
        campaignUrl() {
            return WIDGET_URL + '/c/' + this.campaign._id;
        },
        origin() {
            if (!this.campaign.domain) return '';
            return new URL(this.campaign.domain).host;
        },
    },
    methods: {
        onShow() {
            this.scrollY = window.scrollY;
        },
        onHidden() {
            this.isModalCampaignFsShown = false;
            window.scrollTo(0, this.scrollY);
        },
        onClickCampaign() {
            this.$router.push({ path: `/c/${this.campaign.slug}` });
        },
    },
});
</script>
