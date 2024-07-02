import { stringify, Options } from 'csv-stringify/sync';

export default class CSVService {
    static stringify(data: any[], options?: Options) {
        return stringify(data, options);
    }
}
