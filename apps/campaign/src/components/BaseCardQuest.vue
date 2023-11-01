<template>
    <b-card>
        <template #header>
            <div class="text-center pt-2">
                <BImg v-if="quest.image" class="rounded" lazy fluid :src="quest.image" />
                <BImg v-else-if="logoImage" lazy width="150" height="auto" :src="logoImage" />
            </div>
        </template>
        <div>
            <div class="d-flex justify-content-between">
                <strong class="text-success">{{ quest.title }}</strong>
                <b-badge variant="primary" class="p-2">
                    <i class="fab fa-twitter text-opaque me-0" />
                </b-badge>
            </div>
            <p class="text-opaque mb-0">{{ quest.description }}</p>
        </div>
        <template #footer>
            <b-button @click="isModalCampaignDomainShown = true" variant="primary" size="m" class="w-100 rounded-pill">
                Earn <strong>{{ quest.amount }}</strong> points!
            </b-button>
            <BaseModalCampaignDomain
                :show="isModalCampaignDomainShown"
                :campaign="{ domain: quest.domain }"
                @hidden="isModalCampaignDomainShown = false"
            />
        </template>
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
    computed: {
        logoImage() {
            return this.quest.brand && this.quest.brand.logoImgUrl;
        },
    },
});
</script>
<style>
.card-quest-header {
    background-size: cover;
    background-repeat: no-repeat;
}
</style>
