<template>
    <b-button size="sm" variant="danger" class="text-white" :disabled="isLoading" @click.stop="onClickMinterCreate">
        <b-spinner v-if="isLoading" small />
        <template v-else>
            <BaseIcon
                icon="exclamation-circle"
                class="me-1"
                title="Your Safe multisig requires the minter role for this collection."
            />
            Assign Minter Role
        </template>
    </b-button>
</template>

<script lang="ts">
import { useAccountStore, useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseButtonMinterCreate',
    props: {
        collection: { type: Object as PropType<TERC721>, required: true },
        wallet: { type: Object as PropType<TWallet>, required: true },
    },
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useAccountStore),
    },
    methods: {
        async onClickMinterCreate() {
            try {
                this.isLoading = true;
                await this.collectionStore.createMinter(this.collection._id, this.wallet._id);
                this.$emit('submit');
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
