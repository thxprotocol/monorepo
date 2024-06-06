<template>
    <b-card no-body img-start>
        <div class="position-relative">
            <b-card-img :src="winner.reward.image" start width="140" class="align-self-start" />
            <div class="position-absolute" style="bottom: 0.5rem; left: 0.5rem; right: 0.5rem">
                <b-badge variant="dark" class="w-100 mt-3 p-2" style="font-size: 0.8rem">
                    <span>~{{ winner.reward.marketValue }}</span>
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle text-opaque ms-2"
                        title="This was the market value of the asset at time of purchase"
                    />
                </b-badge>
            </div>
        </div>
        <b-card-body class="p-3">
            <span class="cursor-pointer d-flex align-items-center" @click="isCollapsed = !isCollapsed">
                {{ winner.reward.title }}
                <i class="fas ms-auto" :class="isCollapsed ? 'fa-caret-up' : 'fa-caret-down'" />
            </span>
            <b-collapse v-model="isCollapsed">
                <b-card-text>{{ winner.reward.description }}</b-card-text>
            </b-collapse>
            <b-badge variant="primary" class="mt-3 w-100 p-2" style="font-size: 0.8rem">
                <i class="fas fa-tags me-2 text-opaque" />
                <span class="">{{ winner.code }}</span>
            </b-badge>
            <div class="d-flex mt-3 align-items-center ms-auto">
                <b-avatar :src="winner.account.avatarURL" size="1.5rem" class="me-2" />
                <span>{{ winner.account.username }}</span>
            </div>
        </b-card-body>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardLotteryWinner',
    props: {
        winner: {
            type: Object,
            required: true,
        },
    },
    data() {
        return { isCollapsed: false };
    },
});
</script>
