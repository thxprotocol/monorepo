<template>
    <b-card class="d-none d-lg-block mb-2 mx-lg-0 mb-lg-3" header-class="p-0" body-class="d-flex flex-column">
        <template #header>
            <b-card-title class="d-flex px-3 py-1 m-0 align-items-center">
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="fa fa-trophy me-2 text-opaque"></i>
                </div>
                <div class="flex-grow-1 pe-2">Leaderboard</div>
                <div class="text-accent fw-bold">
                    <b-button variant="link" class="text-opaque" @click="rewardsStore.list()">
                        <i class="fas fa-sync-alt"></i>
                    </b-button>
                </div>
            </b-card-title>
        </template>
        <b-list-group>
            <b-list-group-item class="d-flex px-0 pe-3" :key="key" v-for="(entry, key) of rewardsStore.leaderboard">
                <span class="list-item-field-rank">{{ key + 1 }}</span>
                <span class="list-item-field-address flex-grow-1 ps-2">
                    <b-avatar
                        size="sm"
                        variant="primary"
                        :src="entry.account.profileImg"
                        :alt="`Profile picture of ${entry.account.username}`"
                        class="me-1"
                    />
                    {{ entry.account.username }}
                </span>
                <span class="list-item-field-questcount flex-grow-1 text-opaque pe-3">
                    {{ entry.questsCompleted }} {{ entry.questsCompleted > 1 ? 'quests' : 'quest' }}
                </span>
                <strong class="list-item-field-score">{{ entry.score }}</strong>
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
.list-group-item {
    position: relative;
    padding-left: 40px !important;
}
.list-item-field-rank {
    position: absolute;
    top: 1px;
    left: 1px;
    bottom: 1px;
    width: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}
.list-item-field-user {
    flex-grow: 1;
    display: flex;
    align-items: center;
}
.list-item-field-questcount {
    width: 50px;
    text-align: right;
}
.list-item-field-score {
    width: 50px;
    text-align: right;
}
</style>
