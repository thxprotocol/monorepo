<template>
    <b-container class="py-5 text-white">
        <h1>Usage</h1>
        <p class="lead">Dig deeper in QR Code entry data.</p>
    </b-container>
    <div class="bg-dark py-5 flex-grow-1">
        <b-container>
            <b-card variant="darker">
                <BaseCardTableHeader
                    :query="query"
                    search-placeholder="Search on code or account ID..."
                    :page="page"
                    :limit="limit"
                    :total="entryStore.entries.total"
                    @change-page="onChangePage"
                    @change-limit="onChangeLimit"
                    @query="onChangeQuery"
                    @query-submit="onSubmitQuery"
                />
                <hr />
                <BaseTableEntries @refresh="listEntries" />
            </b-card>
        </b-container>
    </div>
</template>

<script lang="ts">
import { useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { format } from 'date-fns';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Entries',
    data() {
        return {
            selected: [] as string[],
            isLoading: false,
            format,
            query: '',
            page: 1,
            limit: 10,
        };
    },
    computed: {
        ...mapStores(useEntryStore),
    },
    methods: {
        async listEntries() {
            try {
                this.isLoading = true;

                const options: any = {
                    page: this.page,
                    limit: this.limit,
                    query: this.query,
                };
                if (this.$route.query.metadataId) {
                    options['erc721MetadataId'] = this.$route.query.metadataId;
                }

                await this.entryStore.list(options);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onChangePage(page: number) {
            this.page = page;
            await this.listEntries();
        },
        async onChangeLimit(limit: number) {
            this.page = 1;
            this.limit = limit;
            await this.listEntries();
        },
        async onChangeQuery(query: string) {
            this.page = 1;
            this.query = query;
        },
        async onSubmitQuery() {
            await this.listEntries();
        },
    },
});
</script>
