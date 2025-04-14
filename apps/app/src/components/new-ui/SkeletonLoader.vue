<template>
    <div :class="['skeleton-group', `skeleton-group-${size}`]">
        <div v-for="n in count" :key="n" :class="['skeleton-loader', `skeleton-loader-${size}`, 'mb-3']">
            <div :class="`skeleton-image-${size}`"></div>
            <div :class="`skeleton-title-${size}`"></div>
            <div :class="`skeleton-description-${size}`"></div>
            <div :class="`skeleton-button-${size}`"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SkeletonLoader',
    props: {
        count: {
            type: Number,
            default: 5,
        },
        size: {
            type: String,
            default: 'regular',
            validator: (value) => ['regular', 'small', 'rewards'].includes(value),
        },
    },
};
</script>

<style lang="scss" scoped>
.skeleton-group {
    &.skeleton-group-regular {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }

    &.skeleton-group-small {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 15px;
    }
    &.skeleton-group-rewards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
        gap: 20px;
    }
}

.skeleton-loader {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 5px;
    background-color: var(--skeleton-item-bg);
    animation: pulse 1.5s infinite;

    &.skeleton-loader-small {
        padding: 8px;
        min-height: 200px;
    }
}

.skeleton-image {
    &-regular {
        height: 170px;
        background-color: #c0c0c0;
        border-radius: 4px;
        margin-bottom: 10px;
    }

    &-small {
        height: 100px;
        background-color: #c0c0c0;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    &-rewards {
        height: 120px;
        background-color: #c0c0c0;
        border-radius: 4px;
        margin-bottom: 8px;
    }
}

.skeleton-title {
    &-regular {
        height: 20px;
        width: 60%;
        margin-bottom: 10px;
        background-color: #c0c0c0;
        border-radius: 4px;
    }

    &-small {
        height: 15px;
        width: 80%;
        background-color: #c0c0c0;
        border-radius: 4px;
        margin-bottom: 10px;
    }

    &-rewards {
        height: 15px;
        width: 100%;
        background-color: #c0c0c0;
        border-radius: 4px;
        margin-bottom: 5px;
    }
}

.skeleton-description {
    &-regular {
        height: 15px;
        width: 80%;
        margin-bottom: 10px;
        background-color: #c0c0c0;
        border-radius: 4px;
    }

    &-small {
        height: 10px;
        width: 40%;
        background-color: #c0c0c0;
        border-radius: 4px;
    }

    &-rewards {
        display: none;
    }
}

.skeleton-button {
    &-regular {
        height: 25px;
        width: 100%;
        background-color: #c0c0c0;
        border-radius: 4px;
    }

    &-small {
        margin-top: 20px;
        height: 15px;
        width: 50%;
        background-color: #c0c0c0;
        border-radius: 4px;
    }

    &-rewards {
        display: none;
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}

@media (max-width: 992px) {
    .skeleton-group-regular,
    .skeleton-group-small {
        display: grid;
        grid-auto-flow: column;
        overflow-x: auto;
        grid-template-columns: none;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding-bottom: 10px;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .skeleton-group-regular {
        grid-auto-columns: 250px;
        gap: 20px;
    }

    .skeleton-group-small {
        grid-auto-columns: 140px;
        gap: 15px;
    }

    .skeleton-loader-regular {
        min-width: 260px;
    }

    .skeleton-loader-small {
        min-width: 140px;
    }
}
</style>
