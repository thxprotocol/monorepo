<template>
    <b-card class="d-none d-lg-block my-2 mx-lg-0 my-lg-3" header-class="p-0" body-class="d-flex flex-column">
        <template #header>
            <b-card-title class="d-flex px-3 py-1 m-0 align-items-center">
                <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                    <i class="fa fa-trophy me-2 text-opaque"></i>
                </div>
                <div class="flex-grow-1 pe-2">Leaderboard</div>
                <div class="text-accent fw-bold">
                    <b-button variant="link">Refresh</b-button>
                </div>
            </b-card-title>
        </template>
        <p>Lorem ipsum</p>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { RewardSortVariant, RewardVariant } from '../types/enums/rewards';

export default defineComponent({
    name: 'Home',
    data(): any {
        return {
            activeFilters: [],
            sorts: [
                { label: 'Available', key: RewardSortVariant.Available },
                { label: 'Created', key: RewardSortVariant.Created },
                { label: 'Amount', key: RewardSortVariant.Amount },
            ],
            filters: [
                { label: 'Daily', key: RewardVariant.Daily, icon: 'fa fa-calendar' },
                { label: 'Referral', key: RewardVariant.Referral, icon: 'fas fa-comments' },
                { label: 'Conditional', key: RewardVariant.Conditional, icon: 'fas fa-trophy' },
                { label: 'Milestone', key: RewardVariant.Milestone, icon: 'fas fa-flag' },
            ],
        };
    },
    props: {
        filter: {
            type: Array,
            required: true,
        },
        sort: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapStores(useAccountStore),
    },
});
</script>
<style lang="scss" scoped>
.card-header {
    border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);
}
</style>
