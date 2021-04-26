import { ExportTypeInterface } from './constantsAndEnums';

export interface ExportInfo {
    name: string;
    typeOfExport: ExportTypeInterface;
    dimensions: number[];
    uri: string;
}
