<template>
    <b-form>
        <BaseFormGroup label="Name" tooltip="">
            <b-form-input />
        </BaseFormGroup>
        <BaseFormGroup label="Description" tooltip="">
            <b-form-input />
        </BaseFormGroup>
        <BaseFormGroup label="Image" tooltip="">
            <BaseFormInputFile
                :image-src="imageURL"
                :is-loading="isLoading"
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
import { defineComponent, PropType } from 'vue';
import { useAuthStore } from '@thxnetwork/studio/stores';

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
    methods: {
        async onSubmit() {
            const { request } = useAuthStore();

            await request(`/erc721/${this.erc721._id}/metadata`, {
                method: 'POST',
                body: {
                    name: this.name,
                    description: this.description,
                    imageURL: this.imageURL,
                    externalURL: this.externalURL,
                },
            });
        },
    },
});
</script>
