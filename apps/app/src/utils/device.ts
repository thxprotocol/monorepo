// Device detection utility
export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
    userAgent: string;
}

export function detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?=.*\b(?!.*mobile))/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown';

    if (/iphone|ipad|ipod/i.test(userAgent)) {
        platform = 'ios';
    } else if (/android/i.test(userAgent)) {
        platform = 'android';
    } else if (isDesktop) {
        platform = 'desktop';
    }

    return {
        isMobile,
        isTablet,
        isDesktop,
        platform,
        userAgent,
    };
}

export function isCompatibleWithOffer(offer: any, deviceInfo: DeviceInfo): boolean {
    // If no platforms specified, show to all devices
    if (!offer.platforms || offer.platforms.length === 0) {
        return true;
    }

    // Check if the device platform is compatible with the offer
    return offer.platforms.some((platform: string) => {
        const platformLower = platform.toLowerCase();

        // Desktop offers
        if (platformLower === 'desktop' && deviceInfo.isDesktop) {
            return true;
        }

        // iOS offers
        if (platformLower === 'ios' && deviceInfo.platform === 'ios') {
            return true;
        }

        // Android offers
        if (platformLower === 'android' && deviceInfo.platform === 'android') {
            return true;
        }

        // Mobile offers (both iOS and Android)
        if (platformLower === 'mobile' && (deviceInfo.platform === 'ios' || deviceInfo.platform === 'android')) {
            return true;
        }

        // Smartphone offers (mobile but not tablet)
        if (platformLower === 'smartphone' && deviceInfo.isMobile && !deviceInfo.isTablet) {
            return true;
        }

        // Tablet offers
        if (platformLower === 'tablet' && deviceInfo.isTablet) {
            return true;
        }

        return false;
    });
}
