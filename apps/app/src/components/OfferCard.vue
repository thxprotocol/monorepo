<template>
    <b-card class="w-100 my-offer-card m-0" header-class="p-0" body-class="d-flex flex-column p-0">
        <b-collapse v-model="isVisible" class="h-100 d-flex flex-column">
            <div class="d-flex justify-content-center w-100 offer-card-img">
                <img
                    v-if="offer.imageUrl"
                    class="img-fluid"
                    :src="offer.imageUrl"
                    alt="header image"
                    loading="lazy"
                    width="100"
                />
                <div v-else class="placeholder"></div>
                <div v-if="filteredPlatforms.length" class="corner-icons">
                    <span
                        v-for="(platform, index) in filteredPlatforms"
                        :key="index"
                        class="d-flex justify-content-center"
                    >
                        <img
                            v-if="platform === 'android'"
                            :src="androidImg"
                            alt="android"
                            style="width: 14px !important; height: 14px !important"
                        />
                        <i v-else :class="getPlatformIcon(platform)" class="d-flex justify-content-center"></i>
                    </span>
                </div>
            </div>

            <div class="px-1 my-2 d-flex flex-column flex-grow-1">
                <div class="d-flex flex-column justify-content-between">
                    <b-card-text
                        v-if="offer.description"
                        class="flex-grow-1 quest-title-main offer-title-main"
                        v-html="decodeHTML(offer.title)"
                    />
                    <p class="text-capitalize offer-category m-0">
                        {{ offer.categories && offer.categories.length ? offer.categories[0] : '' }}
                    </p>
                </div>
            </div>
            <div class="d-flex align-items-baseline mx-1 offer-btn">
                ${{ offer.payout % 1 === 0 ? offer.payout : offer.payout.toFixed(2) }}
            </div>
        </b-collapse>

        <button class="slide-up-button" @click.stop="openModal">Activate</button>

        <b-modal v-model="showModal" size="lg" hide-footer hide-header centered>
            <div class="offer-wrap">
                <button type="button" class="modal-btn-close" aria-label="Close" @click="closeModal">
                    <i class="fas fa-times"></i>
                </button>

                <transition name="slide" mode="out-in" tag="div">
                    <div v-if="!showQR" class="offer-section">
                        <h2 class="modal-title mb-3">{{ decodeHTML(offer.title) }}</h2>
                        <div class="d-flex flex-column justify-content-between h-100">
                            <div class="overflow-auto mb-2 pb-5" style="max-height: 400px">
                                <div class="d-flex offer-details">
                                    <img
                                        v-if="offer.imageUrl"
                                        class="img-fluid mb-3"
                                        :src="offer.imageUrl"
                                        alt="header image"
                                        loading="lazy"
                                        width="156"
                                        height="156"
                                        style="border-radius: 5px; object-fit: cover"
                                    />
                                    <div class="modal-details ms-3">
                                        <p class="offer-payout">
                                            ${{ offer.payout % 1 === 0 ? offer.payout : offer.payout.toFixed(2) }}
                                        </p>
                                        <p class="offer-provider">{{ offer.provider }}</p>
                                        <p v-if="offer.categories" class="offer-categories">
                                            <span v-for="category in offer.categories" :key="category" class="me-1">
                                                {{ category }}
                                            </span>
                                        </p>
                                        <p v-else-if="offer.platforms" class="offer-categories">
                                            <span v-for="platform in offer.platforms" :key="platform" class="me-1">
                                                {{ platform }}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <p class="modal-offer-description" v-html="decodeHTML(offer.description)"></p>
                                <OfferSteps :offer="offer" />
                            </div>

                            <b-button variant="primary" block class="w-100" @click="earnClick">
                                Earn ${{ offer.payout % 1 === 0 ? offer.payout : offer.payout.toFixed(2) }}
                            </b-button>
                        </div>
                    </div>

                    <div v-else class="qr-section">
                        <div class="d-flex gap-1 align-items-center mt-2">
                            <div
                                type="button"
                                class="offer-back-btn d-flex align-items-center justify-content-center"
                                @click="showQR = false"
                            >
                                <i class="fas fa-less-than"></i>
                            </div>
                            back
                        </div>
                        <div class="d-flex flex-column mt-4">
                            <h2 class="modal-title mb-3 fs-4 ms-5">{{ decodeHTML(offer.title) }}</h2>
                            <div class="d-flex justify-content-center">
                                <div class="position-relative">
                                    <Qrcode :value="offer.santaClickUrl" :size="200" style="border-radius: 8px" />
                                    <img class="qr-icon" :src="imgSanta" alt="icon" />
                                </div>
                            </div>
                            <p class="text-center pt-2">Scan to Install</p>
                            <button class="offer-cls-btn" @click="closeModal">Close</button>
                        </div>
                    </div>
                </transition>
            </div>
        </b-modal>
    </b-card>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { decodeHTML } from '@thxnetwork/app/utils/decode-html';
import Qrcode from 'vue-qrcode';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import imgSanta from '../assets/santa-logo.png';
import hrDivider from '../assets/hr-line.png';
import androidImg from '../assets/android.png';

export default defineComponent({
    name: 'OfferCard',
    components: { Qrcode },
    props: {
        offer: { required: true, type: Object as PropType<any> },
    },
    computed: {
        ...mapStores(useAccountStore),
        filteredPlatforms(): string[] {
            return (this.offer.platforms || []).filter(
                (platform: string) => platform === 'android' || this.getPlatformIcon(platform) !== '',
            );
        },
    },
    data() {
        return {
            decodeHTML,
            isVisible: true,
            showModal: false,
            iconMap: {
                Lootably: 'fas fa-gift',
                Adgate: 'fas fa-tags',
                // Add more mappings as needed
            } as { [provider: string]: string },
            imgSanta,
            hrDivider,
            androidImg,
            showQR: false,
        };
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        openOffer() {
            window.open(this.offer.santaClickUrl, '_blank');
        },
        getPlatformIcon(platform: string) {
            switch (platform) {
                case 'ios':
                    return 'fab fa-apple';
                case 'desktop':
                    return 'fas fa-laptop';
                default:
                    return '';
            }
        },
        closeModal() {
            this.showModal = false;
            this.showQR = false;
        },
        earnClick() {
            if (this.accountStore.isMobile) {
                this.openOffer();
            } else {
                this.showQR = true;
            }
        },
    },
});
</script>

<style lang="scss">
.offer-description {
    font-family: 'Poppins', sans-serif;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    color: var(--body-text);
    text-align: center;
    font-size: 14px;
    text-shadow: 0px 1px 9px rgba(255, 255, 255, 0.3);
    margin-bottom: 4px !important;
}
.offer-categories span {
    font-weight: 500;
    align-self: center;
    background-color: var(--popup-tag-bg);
    border-radius: 50vmax;
    color: var(--popup-tag-color);
    font-size: 10px;
    padding: 0.1rem 0.6rem;
    background-color: var(--offer-cat-bg);
    color: var(--offer-cat-color);
}
.modal-title {
    color: var(--modal-title-color) !important;
    font-size: 18px;
    font-weight: 600;
    padding-right: 24px;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.offer-payout {
    color: var(--title-color);
    font-size: 1.87rem;
    font-weight: 600;
    margin: 0;
}
.offer-provider {
    font-size: 0.7rem;
    margin: 0;
}
.offer-categories {
    margin: 0;
    padding: 0.5rem 0;
}
.modal-offer-description {
    margin: 0;
    -webkit-box-orient: vertical;
    color: var(--offer-modal-desc-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 22px;
}
.reward-amount {
    padding: 0 0.4rem;
    font-size: 0.8rem;
    border-radius: 5px;
    text-align: center;
    justify-content: center;
    display: flex;
    align-items: center;
    align-self: center;
    min-width: 63px;
    min-height: 24px;
    border-radius: 5px;
    border: 0.25px solid rgba(95, 185, 126, 0.5);
    background: var(--offer-reward-amount-bg);
    color: var(--offer-reward-amount-color);
    font-weight: 500;
}
.reward-name {
    font-size: 0.9rem;
    margin: 0;
}
.offer-steps {
    margin-top: 4px;
    font-weight: 500;
    font-size: 0.775rem;
    line-height: 1.2rem;
}
.qr-code {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: fit-content;
    background-color: transparent;
    border: 1px solid rgb(82, 82, 82);
    border-radius: 6px;
    width: fit-content;
    max-width: 100%;
    padding: 10px;
}
.modal-btn-close {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    color: var(--body-text);
    opacity: 0.5;
    font-size: 1.5rem;
    z-index: 111;
    background: none;
}
.modal-btn-close:hover {
    opacity: 0.75;
}
.offer-btn {
    color: var(--offer-btn-color);
    font-feature-settings: 'liga' off, 'clig' off;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 14px;
    text-align: center;
    margin-top: 10px;
}
.my-offer-card {
    position: relative;
    background: var(--quest-item-bg);
    padding: 10px;
    height: 100%;
    padding-bottom: 15px;
    overflow: hidden;
}
.modal-content {
    background-color: var(--modal-bg);
}
.qr-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    pointer-events: none;
}

.placeholder {
    background-color: #8e8e8e;
    width: 100%;
    height: 96px;
    border-radius: 4px;
}

.hr-divider img {
    height: 2px !important;
    width: 72px !important;
}
.offer-card-img {
    position: relative;
}
.corner-icons {
    display: flex;
    flex-direction: column;
    gap: 5px;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10;
    color: rgba(255, 255, 255, 0.75);
    background: rgba(52, 52, 52, 0.8);
    border-radius: 0 4px 4px 4px;
    padding: 3px;
}
.corner-icons i {
    width: 20px;
    height: 15px;
}
.offer-title-main {
    -webkit-line-clamp: 1 !important;
    color: var(--offer-title-main-color);
    font-feature-settings: 'liga' off, 'clig' off;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    margin-bottom: 3px !important;
}
.offer-category {
    color: var(--offer-secondary-color);
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.slide-up-button {
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;
    transition: all 0.3s ease-in-out;
    opacity: 0;
    background: var(--btn-primary-santa);
    padding: 5px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    z-index: 10;
    font-weight: 600;
    margin: 20px;
    margin-bottom: 10px;
    &:hover {
        opacity: 0.9 !important;
    }
}

.my-offer-card:hover .slide-up-button {
    bottom: 0;
    opacity: 1;
}

.content-section {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 1rem;
}

.offer-section {
}

.qr-section {
}
.offer-wrap {
    position: relative;
    overflow: hidden;
}
.offer-cls-btn {
    border: none;
    background: var(--offer-close-bg);
    border-radius: 5px;
    padding: 7px 0;
}
.offer-back-btn {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: var(--offer-back-btn-bg);
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.09);
}
.offer-back-btn i {
    color: #8e8e8e;
    transform: scaleY(1.5);
    font-size: 7px;
}
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.2s ease;
}
.slide-enter-from {
    transform: translateX(100%);
}
.slide-enter-to {
    transform: translateX(0);
}
.slide-leave-from {
    transform: translateX(0);
}
.slide-leave-to {
    transform: translateX(-100%);
}
@media (max-width: 1400px) {
    .my-offer-card {
        min-height: unset;
    }
}
@media (max-width: 992px) {
    .offer-wrap {
        display: flex;
        flex-direction: column;
    }
    .modal-body {
        flex: unset;
    }
    .offer-action-wrap {
        flex-direction: column;
        justify-content: space-between !important;
        flex: 1;
        overflow: hidden;
    }
    .modal-info-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
