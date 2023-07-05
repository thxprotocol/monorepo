<template>
    <b-collapse id="collapse-filters" class="me-2 flex-grow-1">
        <div class="w-100 m-2 align-items-center d-flex">
            <i class="fas fa-filter text-primary me-2"></i>
            <b-dropdown size="sm" variant="primary" class="w-100" no-caret>
                <template #button-content v-if="!filter.length"> No filter </template>
                <template #button-content v-else>
                    <i :class="f.icon" class="me-2" :key="key" v-for="(f, key) of filter"></i>
                </template>
                <b-dropdown-item-button class="dropdown-item-filter" :key="key" v-for="(f, key) of filters">
                    <b-form-checkbox
                        v-model="activeFilters"
                        @change="$emit('change-filter', activeFilters)"
                        :value="f"
                        class="d-block"
                    >
                        <div class="d-inline-flex justify-content-center align-items-center" style="width: 20px">
                            <i :class="f.icon" class="text-opaque me-1" />
                        </div>
                        {{ f.label }}
                    </b-form-checkbox>
                </b-dropdown-item-button>
            </b-dropdown>
            <div class="w-100 m-2 align-items-center d-flex">
                <i class="fas fa-sort text-primary me-2"></i>
                <b-dropdown size="sm" variant="primary" class="w-100" no-caret>
                    <template #button-content> {{ sort.label }} </template>
                    <b-dropdown-item-button @click="$emit('change-sort', s)" :key="key" v-for="(s, key) of sorts">
                        {{ s.label }}
                    </b-dropdown-item-button>
                </b-dropdown>
            </div>
        </div>
    </b-collapse>
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
                { label: 'Default', key: RewardSortVariant.Default },
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
<style lang="scss">
.dropdown-item-filter {
    .form-check {
        padding: 0.15rem 0;
        padding-right: 1.5rem;
        &:hover {
            background-color: var(--bs-dropdown-link-hover-bg) !important;
        }
    }
    .form-check-input {
        float: right;
        margin-right: -1.25rem;
    }
    label {
        display: block;
        cursor: pointer;
        padding: 0 0.5rem;
    }
}
</style>
