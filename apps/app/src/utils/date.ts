const OneDayInMs = 60 * 60 * 24 * 1000;

export const NinetyDaysInMs = OneDayInMs * 90;

export function getThursdaysUntilTimestamp(now: number, futureTimestamp: number) {
    const thursdays = [];

    // Get the current timestamp
    const timestampTomorrow = now + OneDayInMs;

    // Start from the current date and iterate until the future timestamp
    for (let timestamp = timestampTomorrow; timestamp <= futureTimestamp; timestamp += OneDayInMs) {
        const currentDate = new Date(timestamp);

        // Check if the current day is Thursday (day index 4 in JavaScript, where Sunday is 0 and Saturday is 6)
        if (currentDate.getDay() === 4) {
            thursdays.push(timestamp);
        }
    }

    return thursdays;
}
