<template>
    <b-collapse id="collapse-filters" class="me-2 flex-grow-1">
        <div class="w-100 m-2 align-items-center d-flex">
            <i class="fas fa-filter text-primary me-2"></i>
            <b-dropdown size="sm" variant="primary" class="w-100" no-caret>
                <template v-if="!filter.length" #button-content> No filter </template>
                <template v-else #button-content>
                    <i v-for="(f, key) of filter" :key="key" :class="f.icon" class="me-2"></i>
                </template>
                <b-dropdown-item-button v-for="(f, key) of filters" :key="key" class="dropdown-item-filter">
                    <b-form-checkbox
                        v-model="activeFilters"
                        :value="f"
                        class="d-block"
                        @change="$emit('change-filter', activeFilters)"
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
                    <b-dropdown-item-button v-for="(s, key) of sorts" :key="key" @click="$emit('change-sort', s)">
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
import { RewardSortVariant, QuestVariant } from '../types/enums/rewards';

export default defineComponent({
    name: 'Home',
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
                { label: 'Daily', key: QuestVariant.Daily, icon: 'fa fa-calendar' },
                { label: 'Invite', key: QuestVariant.Invite, icon: 'fas fa-comments' },
                { label: 'Social', key: QuestVariant.Social, icon: 'fas fa-trophy' },
                { label: 'Custom', key: QuestVariant.Custom, icon: 'fas fa-flag' },
                { label: 'Web3', key: QuestVariant.Web3, icon: 'fab fa-ethereum' },
            ],
        };
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
