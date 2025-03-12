<template>
    <div class="d-flex about-wrapper">
        <aside class="about-aside">
            <nav class="d-flex about-nav">
                <div v-for="(group, idx) in filteredSectionsForNav" :key="idx" class="text-nowrap about-group">
                    <div class="about-header">{{ group.header }}</div>
                    <a
                        v-for="section in group.sections"
                        :key="section.ref"
                        class="about-nav-item"
                        :class="{ 'active-about-nav-item': activeNavItem === section.ref }"
                        @click.prevent="scrollToSection(section.ref)"
                    >
                        {{ accountStore.isMobile ? section.shortName || section.name : section.name }}
                    </a>
                </div>
            </nav>
        </aside>

        <div ref="mainContent" class="about-main-content overflow-auto flex-1">
            <template v-if="!accountStore.isMobile">
                <section
                    v-for="section in flatSections"
                    :key="section.ref"
                    :ref="(el) => (sectionRefs[section.ref] = el)"
                    class="about-section"
                    :class="[`about-section-${section.ref}`]"
                    :style="{ marginBottom: section.ref === 'help' ? marginBottomLastSection + 'px' : '0' }"
                >
                    <div v-html="section.content"></div>
                </section>
            </template>

            <template v-else>
                <section
                    v-for="section in filteredSections"
                    :key="section.ref"
                    class="about-section"
                    :class="[`about-section-${section.ref}`]"
                >
                    <div v-html="section.content"></div>
                </section>
            </template>
        </div>
        <ImageModal :image-src="selectedImage" :is-visible="isModalVisible" @close="isModalVisible = false" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { getAboutContent } from '@thxnetwork/app/config/aboutContent';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { useThemeStore } from '@thxnetwork/app/stores/Stores';

const props = defineProps({
    activeTab: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(['scrollToTop']);

const accountStore = useAccountStore();
const themeStore = useThemeStore();
const content = ref([]);
const activeNavItem = ref('journey');
const sectionRefs = ref({});
const mainContent = ref(null);
let isManualScrolling = false;
const marginBottomLastSection = ref(0);
const selectedImage = ref('');
const isModalVisible = ref(false);

const flatSections = computed(() => content.value.flatMap((group) => group.sections));

const filteredSections = computed(() => {
    if (accountStore.isMobile) {
        if (activeNavItem.value === 'journey') {
            return flatSections.value.filter((section) => ['journey', 'dashboard', 'navigating'].includes(section.ref));
        }
        return flatSections.value.filter((section) => section.ref === activeNavItem.value);
    }
    return flatSections.value.filter((section) => section.ref === activeNavItem.value);
});

const filteredSectionsForNav = computed(() => {
    return content.value.map((group) => ({
        ...group,
        sections: group.sections.filter(
            (section) => !(accountStore.isMobile && ['dashboard', 'navigating'].includes(section.ref)),
        ),
    }));
});

const scrollToSection = (refName) => {
    isManualScrolling = true;
    activeNavItem.value = refName;
    const section = sectionRefs.value[refName];

    if (accountStore.isMobile) {
        emit('scrollToTop');
        setTimeout(() => {
            isManualScrolling = false;
        }, 600);
        return;
    }

    if (mainContent.value && section) {
        const offsetTop = section.offsetTop;
        const mainContentHeight = mainContent.value.offsetHeight;
        const sectionHeight = section.offsetHeight;
        const maxScrollTop = mainContent.value.scrollHeight - mainContentHeight;

        let targetScrollTop = offsetTop;
        if (offsetTop + sectionHeight > mainContent.value.scrollHeight) {
            targetScrollTop = maxScrollTop;
        }

        mainContent.value.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
        });

        setTimeout(() => {
            isManualScrolling = false;
        }, 600);
    }
};
const updateActiveNavItemOnScroll = () => {
    if (isManualScrolling || accountStore.isMobile || !mainContent.value) return;

    const scrollPosition = mainContent.value.scrollTop;
    const scrollHeight = mainContent.value.scrollHeight;
    const clientHeight = mainContent.value.clientHeight;
    const threshold = 100;

    if (scrollPosition + clientHeight >= scrollHeight - threshold) {
        const lastSection = flatSections.value[flatSections.value.length - 1];
        if (lastSection) {
            activeNavItem.value = lastSection.ref;
        }
        return;
    }

    let closestSection = null;
    let closestDistance = Infinity;

    for (const section of flatSections.value) {
        const sectionElement = sectionRefs.value[section.ref];
        if (sectionElement) {
            const distance = Math.abs(sectionElement.offsetTop - scrollPosition - threshold);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSection = section.ref;
            }
        }
    }

    if (closestSection) {
        activeNavItem.value = closestSection;
    }
};

const calculateBottomPadding = async () => {
    await nextTick();
    const mainContentEl = mainContent.value;
    const lastSectionEl = mainContentEl.querySelector('.about-section-help');
    console.log(mainContentEl, lastSectionEl);
    if (mainContentEl && lastSectionEl) {
        console.log('asdsadasd');
        const mainContentHeight = mainContentEl.getBoundingClientRect().height;
        console.log('msad: ', mainContentHeight);
        const lastSectionHeight = lastSectionEl.getBoundingClientRect().height;
        console.log('msad: ', lastSectionHeight);
        marginBottomLastSection.value = mainContentHeight - lastSectionHeight;
        if (marginBottomLastSection.value < 0) {
            marginBottomLastSection.value = 0;
        }
    }
};

onMounted(async () => {
    content.value = await getAboutContent(themeStore.currentTheme);

    if (mainContent.value) {
        mainContent.value.addEventListener('scroll', updateActiveNavItemOnScroll);
    }
    window.addEventListener('resize', accountStore.onResize);
    accountStore.onResize();
});

onUnmounted(() => {
    if (mainContent.value) {
        mainContent.value.removeEventListener('scroll', updateActiveNavItemOnScroll);
    }
    window.removeEventListener('resize', accountStore.onResize);
});
watch(
    [() => accountStore.isMobile, () => props.activeTab, () => themeStore.currentTheme],
    async ([isMobile, newTab, currentTheme]) => {
        if (isMobile) {
            activeNavItem.value = 'journey';
        }

        if (newTab === 2) {
            calculateBottomPadding();
        }

        content.value = await getAboutContent(currentTheme);
    },
    { immediate: true },
);
</script>
<style>
.about-wrapper {
    margin-top: 30px;
    overflow: hidden;
}
.about-main-content {
    height: calc(100vh - 200px);
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-left: 45px;
}
.about-header {
    color: var(--about-header-color);
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
    text-transform: uppercase;
    padding-block-end: 10px;
}
.about-nav-item {
    display: block;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
    padding-left: 10px;
    transition: color 0.2s ease;
    color: var(--about-nav-item-color);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    text-decoration: none;
}
.active-about-nav-item {
    font-weight: 600;
    color: var(--about-nav-item-active-color);
}
nav > div:not(:last-child) .about-nav-item {
    padding-bottom: 15px;
}
nav > div:not(:first-child) .about-header {
    padding-top: 12px;
}
.about-section h1 {
    color: #de5947;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    margin-bottom: 10px;
}
.about-section h2 {
    color: var(--about-title-color);
    font-size: 30px;
    font-style: normal;
    font-weight: 600;
    line-height: 30px;
    margin-bottom: 15px;
}
.about-section h3,
.about-section h4 {
    color: var(--about-subtitle-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
    margin-bottom: 0;
    margin-bottom: 15px;
}
.about-section p,
.about-section li,
.about-section a {
    color: var(--about-nav-item-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 26px;
}
.about-section p {
    text-align: justify;
}
.about-section p:last-of-type {
    margin-bottom: 0;
}
.about-section img {
    margin-top: 20px;
    margin-bottom: 20px;
    max-width: 80%;
}
.about-section-dashboard img {
    max-width: 60%;
}
.about-section-wallet img {
    max-width: 30%;
}
.about-section:not(:first-of-type) {
    margin-top: 60px;
}
.about-section ul {
    margin-top: 15px;
}
.about-section strong,
.about-section ul li::marker {
    color: var(--about-subtitle-color);
    font-weight: 500;
}
.about-section ul ul {
    list-style-type: disc;
    padding-left: 80px;
}
.about-section li {
    line-height: 26px;
}

.about-section li:not(:first-child) {
    margin-top: 8px;
}
.text-before-bullet {
    margin-bottom: 0;
}
.about-nav {
    flex-direction: column;
}
.about-aside {
    position: sticky;
    top: 0;
}
@media (max-width: 992px) {
    .about-wrapper {
        flex-direction: column;
        margin-top: 0;
        overflow: unset;
    }
    .about-aside {
        position: sticky;
        top: -21px;
        background: var(--sticky-header-bg);
        z-index: 11;
        height: 50px;
        width: 100%;
        padding-top: 10px;
        margin-bottom: 20px;
    }
    .about-nav {
        flex-direction: row;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .about-main-content {
        height: 100%;
        margin-left: 10px;
    }
    .about-section h2 {
        font-size: 22px;
    }
    .about-section h3,
    .about-section h4 {
        font-size: 14px;
    }
    .about-section p,
    .about-section li,
    .about-section a {
        font-size: 13px;
    }
    .about-header {
        display: none;
    }
    .about-group {
        display: flex;
        gap: 20px;
    }
    .about-nav-item {
        padding: 10px !important;
        font-size: 12px;
    }
    .active-about-nav-item {
        border-radius: 5px;
        background: var(--about-mob-nav-bg);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
    }
    .about-section img {
        max-width: 100% !important;
    }
}
</style>
