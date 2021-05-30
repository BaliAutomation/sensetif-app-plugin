export interface SensetifAppSettings {
  customText?: string;
  customCheckbox?: boolean;
}

export interface ProjectSettings {
  name: string;
  title: string;
  city: string;
  geolocation: string;
  subsystems: SubsystemSettings[];
}

export interface SubsystemSettings {
  name: string;
  locallocation: string;
  datapoints: DatapointSettings[];
}

export interface DatapointSettings {
  name: string;
  url: string;
  format: OriginDocumentFormat;
  jsonxpath: string;
  unit: string;
}

export enum OriginDocumentFormat {
  json,
  xml,
}

export interface GlobalSettings {}
