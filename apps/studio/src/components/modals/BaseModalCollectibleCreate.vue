<template>
    <b-modal :id="id" centered hide-footer body-class="gradient-shadow-xl" title="Create Collectible">
        <BaseFormCollectionMetadata :erc721="collection" @submit="onSubmit" />
    </b-modal>
</template>

<script lang="ts">
import { useModal } from 'bootstrap-vue-next';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseModalCollectibleCreate',
    props: {
        id: String,
        collection: { type: Object as PropType<TERC721>, required: true },
    },
    methods: {
        onSubmit() {
            useModal(this.id).hide();
            this.$emit('hidden');
        },
    },
});
</script>
