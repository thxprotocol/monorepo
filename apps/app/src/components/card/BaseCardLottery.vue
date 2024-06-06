<template>
    <b-row class="mb-5">
        <b-col md="12">
            <b-row>
                <b-col md="12">
                    <div class="d-flex">
                        <div class="pe-4">
                            <b-img :src="lottery.logoURL" width="150" />
                        </div>
                        <div class="d-flex flex-column">
                            <div class="d-flex align-items-center">
                                <span class="h3 me-auto">
                                    {{ lottery.project }}
                                </span>
                                <b-badge variant="dark" class="text-warning ms-2 p-2" style="font-size: 0.8rem">
                                    <i class="fas fa-trophy me-2 text-opaque" />
                                    {{ lottery.winners.length }}
                                </b-badge>
                                <b-badge variant="dark" class="text-success ms-2 p-2" style="font-size: 0.8rem">
                                    <i class="fas fa-users me-2 text-opaque" />
                                    {{ lottery.participantCount }}
                                </b-badge>
                            </div>
                            <div class="text-opaque w-100">{{ lottery.description }}</div>
                        </div>
                    </div>
                    <div class="d-flex pt-4 pb-3">
                        <b-button
                            variant="primary"
                            class="rounded-pill px-5 mx-auto"
                            @click="isCollapsed = !isCollapsed"
                        >
                            <i class="fas fa-trophy me-2 text-opaque" />
                            {{ isCollapsed ? 'Hide' : 'Show' }} Winning Tickets
                        </b-button>
                    </div>
                </b-col>
            </b-row>
        </b-col>
        <b-collapse v-model="isCollapsed">
            <b-row>
                <b-col v-for="winner of lottery.winners" lg="6">
                    <BaseCardLotteryWinner v-if="winner.account" class="mb-3" :winner="winner" />
                </b-col>
            </b-row>
        </b-collapse>
    </b-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardLottery',
    props: {
        lottery: {
            type: Object,
            required: true,
        },
    },
    data() {
        return { isCollapsed: false };
    },
});
</script>
