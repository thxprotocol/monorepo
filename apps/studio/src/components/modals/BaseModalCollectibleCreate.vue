<template>
    <b-modal :id="id" centered hide-footer body-class="gradient-shadow-xl" title="Create Collectible">
        <BaseFormCollectionMetadata :erc721="collection" @submit="onSubmit" />
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useModal } from 'bootstrap-vue-next';

export default defineComponent({
    name: 'Collection',
    props: {
        collection: { type: Object as PropType<TERC721>, required: true },
        id: String,
    },
    methods: {
        onSubmit() {
            useModal(this.id).hide();
        },
    },
});
</script>
