<template>
    <b-container class="py-5 text-white">
        <h1>QR Codes</h1>
        <p class="lead">Dig deeper in QR Codes entry data.</p>
    </b-container>
    <div class="bg-dark py-5 flex-grow-1">
        <b-container>
            <b-card variant="light">
                <BaseCardTableHeader
                    :query="query"
                    :page="page"
                    :limit="limit"
                    :total="entryStore.entries.total"
                    @change-page="onChangePage"
                    @change-limit="onChangeLimit"
                    @query="onChangeQuery"
                    @query-submit="onSubmitQuery"
                />
                <hr />
                <b-table :items="entries" variant="light" show-empty responsive="lg" :busy="isLoading">
                    <template #head(uuid) />
                    <template #cell(uuid)="{ item }">
                        <b-link :href="item.uuid.url" target="_blank">
                            {{ item.uuid.value }}
                            <BaseIcon icon="external-link-alt" class="ms-1" />
                        </b-link>
                    </template>
                    <template #head(account)> Account </template>
                    <template #cell(account)="{ item }">
                        <template v-if="item.account">
                            <b-avatar :src="item.account.profileImg" size="1.5rem" class="me-2" />
                            <b-link :href="`mailto: ${item.account.email}`">{{ item.account.username }}</b-link>
                        </template>
                    </template>
                    <template #head(claimedAt)> Claimed </template>
                    <template #head(id) />
                    <template #cell(id)="{ item }">
                        <b-dropdown no-caret size="sm" end variant="link">
                            <template #button-content>
                                <BaseIcon icon="ellipsis-v" />
                            </template>
                            <b-dropdown-item v-b-modal="`modalQRCode${item.id}`"> QR Code </b-dropdown-item>
                            <b-dropdown-item @click="onClickDelete(item.id)"> Delete </b-dropdown-item>
                        </b-dropdown>
                        <BaseModalQRCode :id="`modalQRCode${item.id}`" :url="item.uuid.url" />
                    </template>
                </b-table>
            </b-card>
        </b-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useEntryStore } from '@thxnetwork/studio/stores';
import { format } from 'date-fns';
import { toast } from '@thxnetwork/studio/utils/toast';

export default defineComponent({
    name: 'QR',
    data() {
        return {
            isLoading: false,
            format,
            query: '',
            page: 1,
            limit: 1,
        };
    },
    computed: {
        ...mapStores(useEntryStore),
        entries() {
            return this.entryStore.entries.results.map((entry) => ({
                uuid: {
                    value: entry.uuid,
                    url: `${entry.redirectURL}/${entry.uuid}`,
                },
                collection: entry.erc721.name,
                metadata: entry.metadata.name,
                account: entry.account && {
                    username: entry.account.username,
                    email: entry.account.email,
                    profileImg: entry.account.profileImg,
                    createdAt: format(new Date(entry.account.createdAt), 'yyyy-MM-dd'),
                },
                claimedAt: entry.claimedAt ? format(new Date(entry.claimedAt), 'yyyy-MM-dd') : '',
                id: entry._id,
            }));
        },
    },
    mounted() {
        this.listEntries();
    },
    methods: {
        async listEntries() {
            try {
                this.isLoading = true;
                await this.entryStore.list({ page: this.page, limit: this.limit, query: this.query });
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
            this.limit = limit;
            await this.listEntries();
        },
        async onChangeQuery(query: string) {
            this.query = query;
            await this.listEntries();
        },
        onSubmitQuery() {
            debugger;
        },
        async onClickDelete(id: string) {
            try {
                this.isLoading = true;
                await this.entryStore.remove(id);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
