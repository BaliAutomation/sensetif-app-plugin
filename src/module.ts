import { AppPlugin } from '@grafana/data';
import { SensetifAppSettings } from './types';
import { SensetifRootPage } from './SensetifRootPage';

export const plugin = new AppPlugin<SensetifAppSettings>().setRootPage(SensetifRootPage);
