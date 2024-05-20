export function roundDownFixed(amount: number | string, precision: number) {
    const factor = 10 ** precision;
    return (Math.floor(Number(amount) * factor) / factor).toFixed(precision);
}

export function roundUpFixed(amount: number, precision: number) {
    const factor = 10 ** precision;
    return (Math.ceil(amount * factor) / factor).toFixed(precision);
}

export function parseUnitAmount(price: number) {
    return Number(price / 100).toFixed(2);
}

export function toFiatPrice(number: number | string) {
    // Replace 'en-US' with the appropriate locale for your application
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Change this to the desired currency code
        minimumFractionDigits: 2,
    });
    return formatter.format(Number(number));
}

export function calculatePenalty(
    lockAmount: string,
    penaltyCoefficient = 1,
    leftTimeToUnlock: number,
    maxLockTime: number,
) {
    if (penaltyCoefficient < 0 || penaltyCoefficient > 5) {
        throw new Error('penaltyCoefficient must be between 0 and 5');
    }
    if (leftTimeToUnlock < 0 || maxLockTime <= 0) {
        throw new Error(
            'Invalid time values. leftTimeToUnlock should be non-negative, and maxLockTime should be positive',
        );
    }

    // Ensure leftTimeToUnlock does not exceed maxLockTime
    leftTimeToUnlock = Math.min(leftTimeToUnlock, maxLockTime);

    return Number(lockAmount) * penaltyCoefficient * (leftTimeToUnlock / maxLockTime);
}
