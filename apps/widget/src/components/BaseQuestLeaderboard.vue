<template>
    <b-card class="d-none d-lg-block my-2 mx-lg-0 my-lg-3" header-class="p-0" body-class="d-flex flex-column">
        <template #header>
            <b-card-title class="d-flex px-3 py-1 m-0 align-items-center">
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="fa fa-trophy me-2 text-opaque"></i>
                </div>
                <div class="flex-grow-1 pe-2">Leaderboard</div>
                <div class="text-accent fw-bold">
                    <b-button variant="link">.</b-button>
                </div>
            </b-card-title>
        </template>
        <b-list-group>
            <b-list-group-item
                class="bg-primary text-white d-flex"
                :key="key"
                v-for="(entry, key) of rewardsStore.leaderboard"
            >
                <span class="bg-dark px-2 rounded-pill small d-flex align-items-center">{{ key + 1 }}</span>
                <span class="flex-grow-1 ps-2">{{ entry.address.substring(0, 8) }}...</span>
                <span class="flex-grow-1 text-opaque pe-3">{{ entry.questsCompleted }} quests</span>
                <strong>{{ entry.score }}</strong>
            </b-list-group-item>
        </b-list-group>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';

export default defineComponent({
    name: 'Home',
    data(): any {
        return {};
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
});
</script>
<style lang="scss" scoped>
.card-header {
    border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);
}
</style>
