<template>
    <b-row>
        <b-col md="6" class="d-flex align-items-center justify-content-center">
            <b-form-input
                :debounce="1000"
                :value="query"
                :placeholder="searchPlaceholder"
                class="mb-3 mb-md-0"
                @input="$emit('query', $event)"
                @change="$emit('query-submit', $event)"
            />
        </b-col>
        <b-col md="6" class="d-flex align-items-center justify-content-end">
            <span class="me-2">Limit</span>
            <b-form-select
                v-model="limitModel"
                :value="limit"
                style="max-width: 100px"
                :options="[1, 10, 25, 50, 100]"
                class="me-5"
            />
            <b-pagination v-model="pageModel" class="mb-0" :per-page="limit" :total-rows="total" align="center" />
        </b-col>
    </b-row>
</template>

<script lang="ts">
import { format } from 'date-fns';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardTableHeader',
    props: {
        searchPlaceholder: {
            type: String,
            default: 'Search...',
        },
        query: String,
        page: Number,
        limit: Number,
        total: Number,
    },
    data() {
        return {
            format,
        };
    },
    computed: {
        pageModel: {
            get() {
                return this.page;
            },
            set(value: number) {
                this.$emit('change-page', value);
            },
        },
        limitModel: {
            get() {
                return this.limit;
            },
            set(value: number) {
                this.$emit('change-limit', value);
            },
        },
    },
});
</script>
