<template>
    <b-form>
        <BaseFormGroup label="Amount" tooltip="">
            <b-form-input type="number" />
        </BaseFormGroup>
        <BaseFormGroup label="Logo Image" tooltip="">
            <BaseFormInputFile
                :image-src="imageURL"
                :is-loading="isLoading"
                @done="imageURL = $event"
                @loading="isLoading = $event"
            />
        </BaseFormGroup>
        <BaseFormGroup label="Redirect URL" tooltip="">
            <b-form-input v-model="redirectURL" />
        </BaseFormGroup>
        <b-button type="submit" variant="primary" class="w-100">
            <b-spinner v-if="isLoading" />
            <template v-else> Generate QR Codes </template>
        </b-button>
    </b-form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAuthStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'BaseFormCollectionMetadataQRCodes',
    props: {
        collection: {
            type: Object as PropType<TERC721>,
            required: true,
        },
        metadata: {
            type: Object as PropType<TERC721Metadata>,
            required: true,
        },
    },
    data() {
        return {
            isLoading: false,
            amount: 0,
            imageURL: '',
            redirectURL: '',
        };
    },
    methods: {
        async onSubmit() {
            const { request } = useAuthStore();

            await request(`/qr-codes`, {
                method: 'POST',
                body: {
                    claimAmount: this.amount,
                },
            });
        },
    },
});
</script>
