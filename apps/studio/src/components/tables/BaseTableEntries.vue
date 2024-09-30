<template>
    <b-table :items="entries" align="middle" variant="darker" show-empty hover responsive="lg" :busy="isLoading">
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
            <template v-if="item.account.id">
                <code>{{ item.account.id }}</code>
                <b-link v-b-tooltip class="text-white" :title="`Account created: ${item.account.createdAt}`">
                    <BaseIcon icon="question-circle" class="ms-1" />
                </b-link>
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
                <b-dropdown-item v-b-modal="`modalDeleteQRCodeEntry${item.id}`"> Delete </b-dropdown-item>
            </b-dropdown>
            <BaseModalDelete
                :id="`modalDeleteQRCodeEntry${item.id}`"
                title="Remove QR Code Entry"
                @delete="onClickDelete(item.id)"
            >
                <p class="m-0">Are you sure you want to remove this QR code entry? This action cannot be undone.</p>
                <template #btn-content>
                    <b-spinner v-if="isLoading" small />
                    <template v-else> Remove </template>
                </template>
            </BaseModalDelete>
        </template>
    </b-table>
</template>

<script lang="ts">
import { WALLET_URL } from '@thxnetwork/studio/config/secrets';
import { useAccountStore, useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { useModal } from 'bootstrap-vue-next';
import { format } from 'date-fns';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseTableEntries',
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
                collection: entry.erc721 ? entry.erc721.name : 'Removed',
                metadata: entry.metadata ? entry.metadata.name : 'Removed',
                account: entry.account
                    ? {
                          id: entry.account.sub,
                          createdAt: format(new Date(entry.account.createdAt), 'yyyy-MM-dd HH:mm'),
                      }
                    : {
                          id: '',
                          createdAt: '',
                      },
                claimedAt: entry.claimedAt ? format(new Date(entry.claimedAt), 'yyyy-MM-dd HH:mm') : '',
                id: entry._id,
            }));
        },
    },
    mounted() {
        this.accountStore.getProfiles();
        this.$emit('refresh');
    },
    methods: {
        async onClickDelete(id: string) {
            try {
                this.isLoading = true;
                await this.entryStore.remove(id);
                useModal(`modalDeleteQRCodeEntry${id}`).hide();
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
