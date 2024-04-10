<template>
    <div :style="{ minHeight: '100%' }">
        <BaseNavbarTicker />
        <BaseNavbar />
        <router-view />
        <div class="bg-dark mt-auto">
            <BaseFooter />
        </div>
    </div>
</template>
