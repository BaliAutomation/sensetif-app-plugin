import { PluginMeta } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { SensetifAppSettings } from 'types';

export const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<SensetifAppSettings>>) => {
  try {
    await updatePlugin(pluginId, data);

    // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
    // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
    locationService.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().datasourceRequest({
    url: `/api/plugins/${pluginId}/settings`,
    method: 'POST',
    data,
  });

  return response?.data;
};
