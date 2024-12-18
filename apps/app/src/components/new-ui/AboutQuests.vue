<template>
    <div class="d-flex overflow-hidden about-wrapper">
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
                    v-html="section.content"
                ></section>
            </template>

            <!-- Mobile View: Show only the active section -->
            <template v-else>
                <section
                    v-for="section in filteredSections"
                    :key="section.ref"
                    class="about-section"
                    v-html="section.content"
                ></section>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAboutContent } from '@thxnetwork/app/config/aboutContent';
import { useAccountStore } from '@thxnetwork/app/stores/Account';

const accountStore = useAccountStore();
const content = ref([]);
const activeNavItem = ref('journey');
const sectionRefs = ref({});
const mainContent = ref(null);
let isManualScrolling = false;

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
    if (mainContent.value && section && !accountStore.isMobile) {
        const offsetTop = section.offsetTop;
        mainContent.value.scrollTo({ top: offsetTop, behavior: 'smooth' });

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

onMounted(async () => {
    content.value = await getAboutContent();
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
</script>
<style>
.about-wrapper {
    margin-top: 30px;
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
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
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
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
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
    font-size: 22px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    margin-bottom: 15px;
}
.about-section h3,
.about-section h4 {
    color: var(--about-subtitle-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    margin-bottom: 0;
}
.about-section h4 {
    font-size: 16px;
}
.about-section p,
.about-section li,
.about-section a {
    color: var(--about-nav-item-color);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.about-section p:last-of-type {
    margin-bottom: 0;
}
.about-section img {
    max-width: 80%;
    margin-top: 20px;
}
.about-section:not(:first-of-type) {
    margin-top: 60px;
}
.about-section strong,
.about-section ul li::marker {
    color: var(--about-subtitle-color);
}
.about-section ul ul {
    list-style-type: disc;
    padding-left: 80px;
}
.about-section li {
    line-height: 26px;
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
        margin-top: 10px;
    }
    .about-aside {
        position: fixed;
        z-index: 10;
        top: 200px;
        width: 80%;
    }
    .about-nav {
        flex-direction: row;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        gap: 20px;
    }
    .about-main-content {
        height: 100%;
        margin-left: 10px;
    }
    .about-section h2 {
        font-size: 16px;
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
    }
    .active-about-nav-item {
        border-radius: 5px;
        background: var(--about-mob-nav-bg);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
    }
}
</style>
