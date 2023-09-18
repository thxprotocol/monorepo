<template>
    <b-card>
        <div class="d-flex">
            <div class="me-3">
                <BImg lazy width="40" height="auto" :src="quest.brand.logoImgUrl" />
            </div>
            <div>
                <strong class="text-success">{{ quest.title }}</strong>
                <p class="text-opaque">{{ quest.description }}</p>
            </div>
        </div>
        <b-button @click="isModalCampaignDomainShown = true" variant="primary" size="sm" class="w-100 rounded-pill">
            Earn {{ quest.amount }} points
        </b-button>
        <BaseModalCampaignDomain
            :show="isModalCampaignDomainShown"
            :campaign="{ domain: quest.domain, title: 'test' }"
            @hidden="isModalCampaignDomainShown = false"
        />
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BaseModalCampaignDomain from './BaseModalCampaignDomain.vue';

export default defineComponent({
    name: 'BaseCardQuest',
    components: {
        BaseModalCampaignDomain,
    },
    props: {
        quest: {
            type: Object as PropType<TBaseQuest>,
            required: true,
        },
    },
    data(): any {
        return { isModalCampaignDomainShown: false };
    },
});
</script>
