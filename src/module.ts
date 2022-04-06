import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { SensetifAppSettings } from './types';
import { SensetifRootPage } from './SensetifRootPage';
import { ConfigPageBody } from 'config/ConfigPage';
import { getLimits } from './utils/api';

class SensetifAppPlugin extends AppPlugin<SensetifAppSettings> {
  init(meta: AppPluginMeta<SensetifAppSettings>) {
    super.init(meta);
    getLimits().then((limits) => {
      if (meta.jsonData === undefined) {
        meta.jsonData = {};
        meta.jsonData.limits = limits;
      }
      if (meta.jsonData?.limits === undefined) {
        meta.jsonData.limits = limits;
      }
    });
  }
}

let appPlugin = new SensetifAppPlugin();
appPlugin.setRootPage(SensetifRootPage);
appPlugin.addConfigPage({
  title: 'Setup',
  icon: 'list-ul',
  body: ConfigPageBody,
  id: 'setup',
});
export const plugin = appPlugin;
