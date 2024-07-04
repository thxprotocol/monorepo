<template>
    <div class="p-2 cursor-pointer" @click="accountStore.isModalAccountShown = true">
        <div class="d-flex align-items-center">
            <h3 class="text-white m-0">
                {{ accountStore.account?.username }}
            </h3>
            <div
                v-if="accountStore.config.slug && participant"
                v-b-tooltip
                class="rounded bg-primary py-1 p-2 ms-auto"
                title="Your all time rank in this campaign."
            >
                <i class="fas fa-hashtag small text-opaque" />
                <strong class="ms-1">
                    {{ participant.rank }}
                </strong>
            </div>
        </div>
        <b-progress
            v-if="accountStore.config.slug && participant"
            class="w-100 mt-2"
            style="height: 13px"
            :max="balance + Number(questStore.availablePoints)"
        >
            <b-progress-bar
                variant="success"
                :value="balance"
                :label="`${balance}/${balance + Number(questStore.availablePoints)}`"
            />
        </b-progress>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
        participant() {
            return this.accountStore.participants.find((p) => p.sub === this.accountStore.account?.sub);
        },
        balance() {
            if (!this.participant) return 0;
            return Number(this.participant.balance);
        },
    },
});
</script>
