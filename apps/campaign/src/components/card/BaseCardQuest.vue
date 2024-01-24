<template>
    <b-card header-class="p-0" body-class="justify-content-start" class="w-100">
        <template #header>
            <div
                class="d-flex bg-dark rounded"
                :class="{
                    'justify-content-end align-items-end': !!quest.image,
                    'justify-content-center align-items-center': !quest.image,
                }"
                :style="{
                    height: '180px',
                    backgroundImage: `url(${quest.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                }"
            >
                <BImg
                    lazy
                    :src="logoImage"
                    class="m-3"
                    style="width: auto; height: auto; max-width: 200px; max-height: 75px"
                />
            </div>
        </template>
        <div class="d-flex justify-content-between">
            <strong class="text-success">{{ quest.title }} </strong>
            <div class="flex-shrink-0">
                <b-badge
                    variant="primary"
                    class="p-2"
                    v-b-tooltip
                    :title="`Created: ${quest.createdAt && format(new Date(quest.createdAt), 'dd-MM-yyyy HH:mm')}`"
                >
                    <i class="fas fa-clock text-opaque me-0" />
                </b-badge>
                <b-badge variant="primary" class="p-2 ms-1" v-b-tooltip title="Twitter Quest">
                    <i class="fab fa-twitter text-opaque me-0" />
                </b-badge>
                <b-badge variant="primary" class="p-2 ms-1" v-b-tooltip :title="`Visit ${quest.domain}`">
                    <b-link @click.stop="isModalCampaignDomainShown = true" class="text-white">
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
    name: 'BaseCardQuest',
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
