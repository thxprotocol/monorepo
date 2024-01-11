<template>
    <b-button variant="primary" block class="w-100" @click="isModalShown = true">
        <i class="fas fa-lock me-1" />
        Quest Locked
    </b-button>
    <b-modal title="Quest is locked!" :id="modalId" v-model="isModalShown" centered no-close-on-backdrop>
        <p class="text-opaque">To unlock this quest, complete these quests:</p>
        <template v-for="lock of locks">
            <div class="d-flex justify-content-between">
                {{ lock.title }}
                <strong class="text-accent">{{ lock.pointsAvailable }}</strong>
            </div>
        </template>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="isModalShown = false">Continue</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
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
        return { isModalShown: false };
    },
    computed: {
        ...mapStores(useRewardStore),
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
