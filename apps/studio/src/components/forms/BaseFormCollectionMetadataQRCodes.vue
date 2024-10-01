<template>
    <b-tabs v-model="tabIndex" justified pills content-class="py-3">
        <b-tab title="Codes">
            <b-form @submit.prevent="onSubmitEntries">
                <BaseFormGroup
                    label="Amount"
                    tooltip="The amount of unique QR codes you want to download for this item."
                >
                    <b-form-input v-model="amount" type="number" />
                </BaseFormGroup>
                <BaseFormGroup label="Redirect URL" tooltip="Should be the domain on which your wallet is active.">
                    <b-form-input v-model="redirectURL" />
                </BaseFormGroup>
                <b-button
                    type="submit"
                    :disabled="!amount || !redirectURL || isLoading"
                    variant="primary"
                    class="w-100"
                >
                    <b-spinner v-if="isLoading" small />
                    <template v-else> Create Codes </template>
                </b-button>
            </b-form>
        </b-tab>
        <b-tab title="Design">
            <b-form @submit="onSubmitDownload">
                <b-alert v-model="isAlertShown" variant="primary" show class="py-2">
                    <BaseIcon icon="info-circle" class="me-2" />
                    You can download <strong>{{ codes.length }}</strong> entries as a zip with QR codes.
                </b-alert>
                <BaseFormGroup label="Logo Image" tooltip="Positioned in the center of the QR code">
                    <b-form-file
                        v-model="imageFile"
                        accept=".jpg, .jpeg, .gif, .png"
                        placeholder="Choose or drop here..."
                        drop-placeholder="Drop file here..."
                    ></b-form-file>
                </BaseFormGroup>
                <b-row>
                    <b-col>
                        <BaseFormGroup
                            label="Size"
                            tooltip="The size of the QR code in pixels. Use larger sizes for print media in order to reduce quality loss."
                        >
                            <b-input-group>
                                <b-form-input v-model="size" type="number" />
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

                <b-progress
                    v-if="isLoading && index"
                    :value="index"
                    :max="codes.length"
                    variant="primary"
                    show-value
                    class="mt-2"
                />
                <b-button v-else type="submit" variant="primary" class="w-100" :disabled="isLoading">
                    Download QR Codes
                </b-button>
            </b-form>
        </b-tab>
    </b-tabs>
</template>

<script lang="ts">
import ImgDefault from '@thxnetwork/studio/assets/logo.jpg';
import { API_URL, STUDIO_URL } from '@thxnetwork/studio/config/secrets';
import { useAuthStore, useEntryStore } from '@thxnetwork/studio/stores';
import { loadImage } from '@thxnetwork/studio/utils/image';
import { toast } from '@thxnetwork/studio/utils/toast';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { mapStores } from 'pinia';
import QRCode from 'qrcode';
import { defineComponent, PropType } from 'vue';

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
            isAlertShown: true,
            tabIndex: 0,
            codes: [],
            index: 0,
            amount: 0,
            redirectURL: '',
            imageDefault: ImgDefault,
            imageFile: null,
            size: 400,
            color: '000000',
        };
    },
    computed: {
        ...mapStores(useEntryStore),
    },
    mounted() {
        this.listCodes();
    },
    methods: {
        async onSubmitEntries() {
            try {
                if (!this.metadata) throw new Error('Metadata not found');

                this.isLoading = true;

                await this.entryStore.create({
                    erc721Id: this.collection._id,
                    erc721MetadataId: this.metadata._id,
                    amount: this.amount,
                    redirectURL: this.redirectURL,
                });
                await this.listCodes();
                this.tabIndex = 1;
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        getUrl(uuid: string) {
            const url = new URL(API_URL);
            url.pathname = `/v1/qr-codes/r/${uuid}`;
            return url.toString();
        },
        async listCodes() {
            try {
                this.isLoading = true;
                // Get the first 5000 (max) QR codes for this metadata. Increase if needed.
                const { request } = useAuthStore();
                const data = await request('/qr-codes', {
                    params: { erc721MetadataId: this.metadata._id, page: 1, limit: 5000 },
                });
                this.codes = data.results.map((code: TQRCodeEntry) => code.uuid);
            } catch (error) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onSubmitDownload() {
            try {
                if (!this.metadata) throw new Error('Metadata not found');
                this.isLoading = true;

                const filename = `qr_codes_${new Date().getTime()}`;
                const zip = new JSZip();
                const archive = zip.folder(filename) as JSZip;

                // Iterate over the uuids and create a QR code for each
                for (const uuid of this.codes) {
                    const url = this.getUrl(uuid);
                    const imageURL = this.imageFile ? URL.createObjectURL(this.imageFile) : STUDIO_URL + '/logo.jpg';
                    const data = await this.createQRCode(imageURL, this.size, this.color, url);
                    archive.file(`${uuid}.png`, data, { base64: true });
                    this.index++;
                }

                await zip.generateAsync({ type: 'blob' }).then((content) => saveAs(content, `${filename}.zip`));
                this.index = 0;
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async createQRCode(imageURL: string, size: number, color: string, url: string) {
            const imgSize = (size / 4) * 1.1;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            await QRCode.toCanvas(canvas, url, {
                errorCorrectionLevel: 'H',
                margin: 0,
                color: { dark: color, light: '#ffffff' },
                width: size,
            });

            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            const img = await loadImage(imageURL);
            const positionX = ctx.canvas.height / 2 - imgSize / 2;
            const positionY = ctx.canvas.width / 2 - imgSize / 2;

            ctx.drawImage(img, positionX, positionY, imgSize, imgSize);

            const qrCode = canvas.toDataURL('image/png');

            return qrCode.replace(/^data:image\/png;base64,/, '');
        },
    },
});
</script>
