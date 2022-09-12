import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { SensetifAppSettings } from './types';
import { SensetifRootPage } from './SensetifRootPage';
import { ConfigPageBody } from 'config/ConfigPage';
import { getLimits } from './api';

const appPlugin = new AppPlugin<SensetifAppSettings>();
appPlugin.setRootPage(SensetifRootPage);
appPlugin.addConfigPage({
  title: 'Setup',
  icon: 'list-ul',
  body: ConfigPageBody,
  id: 'setup',
});

const existingInitFn = appPlugin.init;
appPlugin.init = (meta: AppPluginMeta<SensetifAppSettings>) => {
  existingInitFn(meta);
  if (meta !== undefined) {
    let promise = getLimits();
    promise.then((limits) => {
      // 'meta.jsonData==undefines' does NOT capture the missing jsonData at some times, so the null check is ALSO needed.
      if (meta.jsonData === undefined || meta.jsonData === null) {
        meta.jsonData = {};
      }
      if (meta.jsonData.limits === undefined) {
        meta.jsonData.limits = limits;
      }
    });
  }
};
export const plugin = appPlugin;
