<template>
    <div>
        <div v-if="offer.events && offer.events.length">
            <h2 class="modal-title mt-4">Rewards</h2>
            <div class="rewards-list">
                <div v-for="event in offer.events" :key="event.name" class="reward-item d-flex align-items-center mb-2">
                    <div class="reward-amount me-2">${{ event.payout.toFixed(2) }}</div>
                    <div class="reward-name">
                        {{ event.name }}
                    </div>
                </div>
            </div>
        </div>
        <div v-if="offer.terms">
            <h2 class="modal-title mt-4">Steps</h2>
            <p class="offer-steps">{{ offer.terms }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'OfferSteps',
    props: {
        offer: { required: true, type: Object as PropType<any> },
    },
});
</script>
