<template>
    <b-container class="py-5 text-white">
        <h1>QR Codes</h1>
        <p class="lead">Dig deeper in QR Codes entry data.</p>
    </b-container>
    <div class="bg-dark py-5 flex-grow-1">
        <b-container>
            <b-card variant="darker">
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
                <b-table
                    :items="entries"
                    align="middle"
                    variant="darker"
                    show-empty
                    hover
                    responsive="lg"
                    :busy="isLoading"
                >
                    <template #head(select)>
                        <b-form-checkbox @change="selected = $event ? entries.map((item) => item.code.uuid) : []" />
                    </template>
                    <template #cell(select)="{ item }">
                        <b-form-checkbox v-model="selected" :value="item.code.uuid" />
                    </template>
                    <template #head(code)>Code</template>
                    <template #cell(code)="{ item }">
                        <b-link :href="item.code.url" target="_blank" class="text-decoration-none">
                            <code>{{ item.code.uuid }}</code>
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
                    <template #head(collection)> Collection </template>
                    <template #cell(collection)="{ item }">
                        {{ item.collection }}
                    </template>
                    <template #head(metadata)> Metadata </template>
                    <template #cell(metadata)="{ item }">
                        {{ item.metadata }}
                    </template>
                    <template #head(claimedAt)> Claimed </template>
                    <template #head(id) />
                    <template #cell(id)="{ item }">
                        <b-dropdown no-caret size="sm" end variant="link">
                            <template #button-content>
                                <BaseIcon icon="ellipsis-v text-light" />
                            </template>
                            <b-dropdown-item @click="onClickDelete(item.id)"> Delete </b-dropdown-item>
                        </b-dropdown>
                        <BaseModalQRCode :id="`modalQRCode${item.id}`" :url="item.code.url" />
                    </template>
                </b-table>
            </b-card>
        </b-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useEntryStore, useAccountStore } from '@thxnetwork/studio/stores';
import { format } from 'date-fns';
import { toast } from '@thxnetwork/studio/utils/toast';
import { WALLET_URL } from '@thxnetwork/studio/config/secrets';

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
        ...mapStores(useEntryStore, useAccountStore),
        entries() {
            return this.entryStore.entries.results.map((entry) => ({
                // select: entry.uuid,
                code: {
                    uuid: entry.uuid,
                    url: this.accountStore.profiles.length
                        ? `${WALLET_URL}/${this.accountStore.profiles[0]._id}/collect/${entry.uuid}`
                        : '',
                },
                collection: entry.erc721.name,
                metadata: entry.metadata.name,
                account: entry.account && {
                    username: entry.account.username,
                    email: entry.account.email,
                    profileImg: entry.account.profileImg,
                    createdAt: format(new Date(entry.account.createdAt), 'yyyy-MM-dd HH:mm'),
                },
                claimedAt: entry.claimedAt ? format(new Date(entry.claimedAt), 'yyyy-MM-dd HH:mm') : '',
                id: entry._id,
            }));
        },
    },
    async mounted() {
        this.accountStore.getProfiles();
        this.listEntries();
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
            this.query = query;
        },
        async onSubmitQuery() {
            await this.listEntries();
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
