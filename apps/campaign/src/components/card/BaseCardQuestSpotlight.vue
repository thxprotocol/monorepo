<template>
    <b-card header-class="p-0" body-class="justify-content-start" class="w-100">
        <template #header>
            <div
                class="d-flex bg-dark rounded"
                :class="{
                    'justify-content-end align-items-end': !!backgroundImage,
                    'justify-content-center align-items-center': !backgroundImage,
                }"
                :style="{
                    height: '180px',
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                }"
            >
                <BImg
                    lazy
                    :src="logoImage"
                    class="m-3 rounded"
                    style="width: auto; height: auto; max-width: 150px; max-height: 50px"
                />
            </div>
        </template>
        <div class="d-flex justify-content-between">
            <strong class="text-success">{{ quest.title }} </strong>
            <div class="flex-shrink-0">
                <b-badge
                    v-b-tooltip
                    variant="primary"
                    class="p-2"
                    :title="`Created: ${quest.createdAt && format(new Date(quest.createdAt), 'dd-MM-yyyy HH:mm')}`"
                >
                    <i class="fas fa-clock text-opaque me-0" />
                </b-badge>
                <b-badge v-b-tooltip variant="primary" class="p-2 ms-1" title="Twitter Quest">
                    <i class="fab fa-twitter text-opaque me-0" />
                </b-badge>
                <b-badge v-b-tooltip variant="primary" class="p-2 ms-1" :title="`Visit ${quest.domain}`">
                    <b-link class="text-white" @click.stop="isModalCampaignDomainShown = true">
                        <i class="fas fa-external-link-alt text-opaque me-0" />
                    </b-link>
                </b-badge>
            </div>
        </div>
        <p class="mb-0">{{ quest.description }}</p>
        <template #footer>
            <b-button class="w-100" :to="`/c/${quest.poolId}`" variant="primary">
                Earn <strong>{{ quest.amount }}</strong> points!
            </b-button>
            <BaseModalExternalURL
                :show="isModalCampaignDomainShown"
                :url="quest ? quest.domain : ''"
                @hidden="isModalCampaignDomainShown = false"
            />
        </template>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardQuestSpotlight',
    props: {
        quest: {
            type: Object as PropType<TBaseQuest & { domain: string; amount: number; brand: any }>,
            required: true,
        },
    },
    data() {
        return { format, isModalCampaignDomainShown: false };
    },
    computed: {
        backgroundImage() {
            return this.quest.image || (this.quest.brand && this.quest.brand.backgroundImgUrl);
        },
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
