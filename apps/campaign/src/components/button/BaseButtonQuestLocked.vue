<template>
    <b-button variant="primary" block class="w-100" @click="isModalShown = true">
        <i class="fas fa-lock me-1" />
        Locked
    </b-button>
    <b-modal :id="`modalQuestLock${id}`" v-model="isModalShown" title="Locked!" centered no-close-on-backdrop>
        <p class="text-opaque">To unlock this quest, complete these quests:</p>
        <template v-for="lock of locked">
            <div v-if="lock" class="d-flex justify-content-between">
                {{ lock.title }}
                <strong class="text-accent">{{ lock.amount }}</strong>
            </div>
            <b-alert v-else v-model="isAlertShown" show variant="info" class="p-2 px-3">
                <i class="fas fa-info-circle me-1" />
                A quest that is no longer available still locks this quest...
            </b-alert>
        </template>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="isModalShown = false">Continue</b-button>
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
    },
    data() {
        return { isAlertShown: true, isModalShown: false };
    },
    computed: {
        ...mapStores(useQuestStore),
        locked() {
            if (!this.questStore.quests.length) return;
            return this.locks.map((lock: { questId: string }) => {
                return this.questStore.quests.find((q) => lock.questId === q._id);
            });
        },
    },
});
</script>
