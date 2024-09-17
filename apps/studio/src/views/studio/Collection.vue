<template>
    {{ collection }}
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useCollectionStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'Collection',
    computed: {
        ...mapStores(useCollectionStore),
        collection(): TERC721 {
            return this.collectionStore.collections.find(
                (collection) => collection._id === this.$route.params.id,
            ) as TERC721;
        },
    },
    async mounted() {
        await this.collectionStore.get(this.$route.params.id);
    },
});
</script>
