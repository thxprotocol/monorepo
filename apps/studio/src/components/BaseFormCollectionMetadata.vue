<template>
    <b-form @submit="onSubmit">
        <BaseFormGroup label="Name" tooltip="">
            <b-form-input v-model="name" />
        </BaseFormGroup>
        <BaseFormGroup label="Description" tooltip="">
            <b-form-textarea v-model="description" />
        </BaseFormGroup>
        <BaseFormGroup label="Image" tooltip="">
            <BaseFormInputFile
                :image-src="imageURL"
                :is-loading="isLoading"
                @remove="imageURL = ''"
                @done="imageURL = $event"
                @loading="isLoading = $event"
            />
        </BaseFormGroup>
        <BaseFormGroup label="External URL" tooltip="">
            <b-form-input v-model="externalURL" />
        </BaseFormGroup>
        <b-button type="submit" variant="primary" class="w-100">
            <b-spinner v-if="isLoading" />
            <template v-else> Create Metadata </template>
        </b-button>
    </b-form>
</template>

<script lang="ts">
import { useCollectionStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseFormCollectionMetadata',
    props: {
        erc721: {
            type: Object as PropType<TERC721>,
            required: true,
        },
    },
    data() {
        return {
            isLoading: false,
            name: '',
            description: '',
            imageURL: '',
            externalURL: '',
        };
    },
    computed: {
        ...mapStores(useCollectionStore),
    },
    methods: {
        async onSubmit() {
            try {
                this.isLoading = true;
                await this.collectionStore.createMetadata(this.erc721._id, {
                    name: this.name,
                    description: this.description,
                    imageUrl: this.imageURL,
                    externalUrl: this.externalURL,
                });
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
