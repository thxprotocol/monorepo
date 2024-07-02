import { stringify } from 'csv-stringify/sync';

export default class CSVService {
    static async stringify(data: any[]) {
        const columns = Object.keys(data[0]);
        return stringify(data, { columns, header: true });
    }
}
