<template>
    <b-button block class="w-100 locked-btn" @click="isModalShown = true">
        <!-- <i class="fas fa-lock me-1" /> -->
        Claim
    </b-button>
    <b-modal :id="`modalQuestLock${id}`" v-model="isModalShown" title="Locked!" centered no-close-on-backdrop>
        <template #header>
            <h5 class="modal-title">Locked</h5>
            <b-link class="btn-close" @click.prevent="isModalShown = false">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <p class="text-opaque ms-0">To unlock, complete {{ locked?.length === 1 ? 'this quest' : 'these quests' }}:</p>
        <template v-for="lock of locked">
            <div v-if="lock" class="d-flex justify-content-between">
                {{ lock.title }}
                <!-- <strong class="text-accent">{{ lock.amount }}</strong> -->
            </div>
            <b-alert v-else v-model="isAlertShown" show variant="info" class="p-2 px-3">
                <i class="fas fa-info-circle me-1" />
                A quest that is no longer available still locks this quest...
            </b-alert>
        </template>
        <template #footer>
            <b-button class="w-100 locked-btn" @click="isModalShown = false">Continue</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useQuestStore } from '../../stores/Quest';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseButtonQuestLocked',
    props: {
        id: String,
        locks: {
            type: Array as PropType<{ questId: string; variant: number }[]>,
            required: true,
        },
        amount: Number,
    },
    data() {
        return { isAlertShown: true, isModalShown: false };
    },
    computed: {
        ...mapStores(useQuestStore),
        locked() {
            if (!this.questStore.quests.length) return;
            const lockedQuests = this.locks.map((lock: { questId: string }) => {
                return this.questStore.quests.find((q) => lock.questId === q._id);
            });
            return lockedQuests;
        },
    },
});
</script>

<style>
.my-btn {
    box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 4px 0px, rgba(255, 255, 255, 0.12) 0px 4px 4px 0px inset;
    border-radius: 20px;
    padding: 6px !important;
    height: auto;
}
.locked-btn {
    background: var(--btn-disabled-bg) !important;
    border: 1px solid var(--btn-disabled-border);
    opacity: 0.55;
    color: var(--btn-disabled-color);
    font-weight: 500;
    border-radius: 5px;
    box-shadow: var(--balance-box-shadow);
    padding: 7px 0px;
    cursor: default !important;
    min-height: 36px;
}
.locked-btn:hover,
.locked-btn:focus,
.locked-btn:active,
.locked-btn:focus-visible {
    background: var(--btn-disabled-bg) !important;
    border-color: var(--btn-disabled-border) !important;
    color: var(--btn-disabled-color) !important;
}
</style>
