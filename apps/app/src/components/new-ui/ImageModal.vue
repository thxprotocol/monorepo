<template>
    <div v-if="isVisible" class="modal-image-backdrop" @click="closeModal">
        <div class="modal-image-content">
            <img :src="imageSrc" alt="Expanded view" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    imageSrc: String,
    isVisible: Boolean,
});

const emit = defineEmits(['close']);

const closeModal = () => {
    emit('close');
};
</script>

<style>
.modal-image-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--image-modal-backdrop);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow: auto;
    scrollbar-width: none;
}

.modal-image-content {
    max-width: 90%;
    max-height: 90%;
}

.modal-image-content img {
    width: 100%;
    height: auto;
    border-radius: 8px;
}
</style>
