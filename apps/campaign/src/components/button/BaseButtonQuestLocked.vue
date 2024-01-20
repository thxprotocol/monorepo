<template>
    <b-button variant="primary" block class="w-100" @click="isModalShown = true">
        <i class="fas fa-lock me-1" />
        Quest Locked
    </b-button>
    <b-modal title="Quest is locked!" :id="modalId" v-model="isModalShown" centered no-close-on-backdrop>
        <p class="text-opaque">To unlock this quest, complete these quests:</p>
        <template v-for="(lock, key) of locks">
            <div v-if="lock" class="d-flex justify-content-between">
                {{ lock.title }}
                <strong class="text-accent">{{ lock.pointsAvailable }}</strong>
            </div>
            <b-alert v-else v-model="isAlertShown" show variant="info" class="p-2 px-3">
                <i class="fas fa-info-circle me-1" />
                A quest has been removed but still locks this quest...
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
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseButtonQuestLocked',
    props: {
        quest: {
            type: Object,
            required: true,
        },
    },
    data() {
        return { isAlertShown: true, isModalShown: false };
    },
    computed: {
        ...mapStores(useQuestStore),
        modalId() {
            return `modalQuestLock${this.quest._id}`;
        },
        locks() {
            if (!this.rewardsStore.quests.length) return;
            return this.quest.locks.map((lock: { questId: string }) =>
                this.rewardsStore.quests.find((q) => lock.questId === q._id),
            );
        },
    },
    mounted() {
        // debugger;
    },
    methods: {
        open() {
            //
        },
    },
});
</script>
