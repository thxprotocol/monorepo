<template>
    <div v-if="accountStore.config.slug && participant" class="d-flex flex-column">
        <div class="d-flex p-2 m-0 align-items-center">
            <div class="flex-grow-1 pe-2">
                Leaderboard
                <i v-b-tooltip class="fas fa-info-circle small text-opaque" :title="`Since ${leaderboardStart}`" />
            </div>
            <b-button size="sm" variant="primary" @click="onClickRefresh">
                <b-spinner v-if="isLoading" small />
                <i v-else class="fas small fa-sync-alt" />
            </b-button>
        </div>
        <b-list-group class="list-group-overflow">
            <b-list-group-item v-for="(entry, key) of accountStore.leaderboard" :key="key" class="d-flex px-0 pe-3">
                <span class="list-item-field-rank">
                    <i class="fas fa-hashtag me-1 text-opaque" />
                    {{ entry.rank }}
                </span>
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
                    {{ entry.questEntryCount }}
                    <i class="fas fa-tasks ms-1" />
                </span>
                <strong class="list-item-field-score">{{ entry.score }}</strong>
            </b-list-group-item>
        </b-list-group>
        <hr class="mt-2 mb-0" style="opacity: 0.1" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { subWeeks, format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardLeaderboard',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        participant() {
            return this.accountStore.participants.find((p) => p.sub === this.accountStore.account?.sub);
        },
        leaderboardStart() {
            return format(subWeeks(new Date(), this.accountStore.config.leaderboardInWeeks), 'MMMM dd, yyyy');
        },
    },
    mounted() {
        this.accountStore.getLeaderboard();
    },
    methods: {
        async onClickRefresh() {
            this.isLoading = true;
            await this.accountStore.getLeaderboard();
            this.isLoading = false;
        },
    },
});
</script>
<style lang="scss">
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
