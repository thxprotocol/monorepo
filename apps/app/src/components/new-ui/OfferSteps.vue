<template>
    <div v-if="offer.events && offer.events.length">
        <h2 class="modal-title mt-4 fs-5">Rewards</h2>
        <div class="rewards-list">
            <div
                v-for="event in offer.events"
                :key="event.name"
                class="offer-reward-item d-flex align-items-center mb-2"
            >
                <div class="reward-amount me-2">${{ event.payout.toFixed(2) }}</div>
                <div class="reward-name">
                    {{ event.name }}
                </div>
            </div>
        </div>
    </div>
    <div v-if="offer.terms">
        <h2 class="modal-title mt-4 fs-5">Steps</h2>
        <p class="modal-offer-description">{{ offer.terms }}</p>
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

<style lang="scss">
.offer-reward-item {
    background: var(--offer-reward-bg);
    width: 100%;
    gap: 15px;
    padding: 13px 15px;
    border-radius: 2px;
}
</style>
