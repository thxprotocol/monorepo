<template>
    <b-card class="w-100 my-offer-card m-0 p-3" header-class="p-0" body-class="d-flex flex-column p-0">
        <div class="d-flex p-3 m-0 align-items-center pt-0">
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="me-2 text-primary fas fa-gift fs-5"></i>
            </div>
            <div class="flex-grow-1 pe-2 offer-description fs-5">
                {{ decodeHTML(offer.title) }}
            </div>
            <!-- <div v-if="offer.payout" class="text-primary fw-bold" style="white-space: nowrap">
                    {{ offer.payout }} {{ offer.currency }}
                </div> -->
        </div>

        <b-collapse v-model="isVisible">
            <div class="d-flex justify-content-center w-100 offer-card-img">
                <img v-if="offer.imageUrl" class="img-fluid" :src="offer.imageUrl" alt="header image" loading="lazy" />
                <div v-else class="placeholder"></div>
            </div>

            <div class="px-3 mt-3">
                <div class="d-flex align-items-start justify-content-between">
                    <b-card-text
                        v-if="offer.description"
                        class="flex-grow-1 mb-2 offer-description"
                        v-html="decodeHTML(offer.description)"
                    />
                </div>

                <button
                    variant="primary"
                    block
                    class="w-100 mb-1 offer-btn btn-primary"
                    target="_blank"
                    @click="openModal"
                >
                    Claim <strong>${{ offer.payout % 1 === 0 ? offer.payout : offer.payout.toFixed(2) }}</strong>
                </button>

                <!-- <div class="d-flex align-items-center justify-content-between mt-2 pb-2" style="opacity: 0.5">
                    <div class="d-flex align-items-center text-opaque small">
                        <span v-if="offer.provider" class="text-white me-1"> {{ offer.provider }} &CenterDot; </span>
                        <span>{{ offer.epc }} </span>
                    </div>
                </div> -->
            </div>
        </b-collapse>
        <b-modal v-model="showModal" size="lg" hide-footer hide-header centered>
            <div class="offer-wrap">
                <button type="button" class="modal-btn-close" aria-label="Close" @click="showModal = false">
                    <i class="fas fa-times"></i>
                </button>
                <h2 class="modal-title">{{ decodeHTML(offer.title) }}</h2>
                <div class="modal-body d-flex flex-column">
                    <div class="d-flex align-items-center offer-details">
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
                            <p class="offer-categories">
                                <span v-for="category in offer.categories" :key="category" class="me-1">
                                    {{ category }}
                                </span>
                            </p>
                            <p class="modal-offer-description" v-html="decodeHTML(offer.description)"></p>
                        </div>
                        <div v-if="accountStore.isMobile">
                            <OfferSteps :offer="offer" />
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-4 modal-info-wrap justify-content-between">
                    <div v-if="!accountStore.isMobile">
                        <OfferSteps :offer="offer" />
                    </div>
                    <div v-if="!accountStore.isMobile" class="qr-code mt-4">
                        <h3 class="modal-title">Scan on your mobile</h3>
                        <div class="position-relative">
                            <Qrcode :value="offer.santaClickUrl" :size="200" />
                            <img class="qr-icon" :src="imgSanta" alt="icon" />
                        </div>
                    </div>

                    <div v-else>
                        <b-button variant="primary" block class="w-100" @click="openOffer">
                            Earn ${{ offer.payout % 1 === 0 ? offer.payout : offer.payout.toFixed(2) }}
                        </b-button>
                    </div>
                </div>
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
export default defineComponent({
    name: 'OfferCard',
    components: {
        Qrcode,
    },
    props: {
        offer: { required: true, type: Object as PropType<any> },
    },
    computed: {
        ...mapStores(useAccountStore),
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
        };
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        openOffer() {
            window.open(this.offer.santaClickUrl, '_blank');
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
}
.offer-categories span {
    font-weight: 500;
    align-self: center;
    background-color: var(--popup-tag-bg);
    border-radius: 50vmax;
    color: var(--popup-tag-color);
    font-size: 10px;
    padding: 0.1rem 0.6rem;
    background-color: rgba(14, 34, 64, 1);
    color: rgba(93, 154, 238, 1);
}
.modal-title {
    color: var(--modal-title-color) !important;
    font-size: 1rem;
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
    font-size: 1rem;
    margin: 0;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
.reward-amount {
    padding: 0 0.4rem;
    background: rgba(95, 185, 126, 0.13);
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
    background: rgba(95, 185, 126, 0.13);
    color: rgba(95, 185, 126, 1);
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
.offer-card-img {
    margin-top: 0.5rem;
}
.offer-btn {
    outline: none;
    border-radius: 5px;
    background: linear-gradient(290deg, #b13030 30.17%, #de5947 97.55%);
    border: none;
    padding: 7px 0;
}
.my-offer-card {
    background: var(--main-content-bg);
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
@media (max-width: 992px) {
    .modal-info-wrap {
        display: block !important;
    }
    .offer-card-img {
    }
    .offer-wrap {
        display: flex;
        flex-direction: column;
        height: 70vh;
    }
    .modal-body {
        overflow: auto;
        flex: 1;
    }
    .offer-details {
        flex-direction: column;
        align-items: baseline !important;
    }
}
</style>
