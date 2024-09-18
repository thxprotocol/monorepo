<template>
    <b-form @submit="onSubmit">
        <BaseFormGroup label="Amount" tooltip="The amount of unique QR codes you want to download for this item.">
            <b-form-input v-model="amount" type="number" />
        </BaseFormGroup>
        <BaseFormGroup label="Redirect URL" tooltip="Should be the domain on which your wallet is active.">
            <b-form-input v-model="redirectURL" />
        </BaseFormGroup>
        <BaseFormGroup label="Logo Image" tooltip="Positioned in the center of the QR code">
            <BaseFormInputFile
                :image-src="imageURL"
                :is-loading="isLoading"
                @done="imageURL = $event"
                @loading="isLoading = $event"
            />
        </BaseFormGroup>
        <b-row>
            <b-col>
                <BaseFormGroup
                    label="Size"
                    tooltip="The size of the QR code in pixels. Use larger sizes for print media in order to reduce quality loss."
                >
                    <b-input-group>
                        <b-form-input type="number" />
                        <b-input-group-text>px</b-input-group-text>
                    </b-input-group>
                </BaseFormGroup>
            </b-col>
            <b-col>
                <BaseFormGroup
                    label="Color"
                    tooltip="The foreground color of the QR code. Make sure it contrasts to the default white background."
                    class="ms-3"
                >
                    <b-input-group>
                        <b-form-input v-model="color" type="color" />
                        <b-input-group-text>{{ color }}</b-input-group-text>
                    </b-input-group>
                </BaseFormGroup>
            </b-col>
        </b-row>
        <hr />
        <b-button type="submit" variant="primary" class="w-100">
            <b-spinner v-if="isLoading" />
            <template v-else> Download QR Codes </template>
        </b-button>
    </b-form>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useEntryStore } from '@thxnetwork/studio/stores';
import { mapStores } from 'pinia';
import { toast } from '@thxnetwork/studio/utils/toast';

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
            color: '000000',
            amount: 0,
            imageURL: '',
            redirectURL: '',
        };
    },
    computed: {
        ...mapStores(useEntryStore),
    },
    methods: {
        async onSubmit() {
            try {
                this.isLoading = true;
                if (!this.metadata) throw new Error('Metadata not found');

                this.entryStore.create({
                    erc721Id: this.collection._id,
                    erc721MetadataId: this.metadata._id,
                    amount: this.amount,
                    redirectURL: this.redirectURL,
                });

                // Redirect to the QR codes page
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
