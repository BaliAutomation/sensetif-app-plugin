import React, { useState, ChangeEvent } from 'react';
import { AppPluginMeta, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { Alert, Button, Field, HorizontalGroup, Input } from '@grafana/ui';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { SensetifAppSettings } from 'types';

type State = {
  // Tells us if the API key secret is set.
  // Set to `true` ONLY if it has already been set and haven't been changed.
  // (We unfortunately need an auxiliray variable for this, as `secureJsonData` is never exposed to the browser after it is set)
  isTtnApiKeySet: boolean;
  // An secret key for our custom API.
  ttnApiKey: string;
};

interface Props extends PluginConfigPageProps<AppPluginMeta<SensetifAppSettings>> {}

export const ConfigPageBody = ({ plugin }: Props) => {
  const { jsonData } = plugin.meta;
  const [state, setState] = useState<State>({
    ttnApiKey: '',
    isTtnApiKeySet: Boolean(jsonData?.isTtnApiKeySet),
  });

  const onResetTtnApiKey = () =>
    setState({
      ...state,
      ttnApiKey: '',
      isTtnApiKeySet: false,
    });

  const onChangeTtnApiKey = (event: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      ttnApiKey: event.target.value.trim(),
    });
  };

  if (plugin.meta.enabled) {
    <Alert severity="info" title={plugin.meta.name}>
      Plugin already enabled
    </Alert>;
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() =>
          updatePluginAndReload(plugin.meta.id, {
            enabled: true,
            pinned: true,
            jsonData: {
              isTtnApiKeySet: true,
            },
            // This cannot be queried later by the frontend.
            // We don't want to override it in case it was set previously and left untouched now.
            secureJsonData: state.isTtnApiKeySet
              ? undefined
              : {
                  apiKey: state.ttnApiKey,
                },
          })
        }
      >
        Enable
      </Button>

      {/* API Key */}
      <Field label="API Key" description="A secret key for authenticating to our custom API">
        <SecretInput
          width={60}
          data-testid="api-key"
          id="api-key"
          value={state?.ttnApiKey}
          isConfigured={state.isTtnApiKeySet}
          placeholder={'Your secret API key'}
          onChange={onChangeTtnApiKey}
          onReset={onResetTtnApiKey}
        />
      </Field>
    </>
  );
};

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<SensetifAppSettings>>) => {
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

// Secret Input

type SecretInputProps = React.ComponentProps<typeof Input> & {
  /** Defines if the password is already set or not. (It is needed as in some cases the backend doesn't send back the actual password) */
  isConfigured: boolean;
  /** Called when the user clicks on the "Reset" button */
  onReset: () => void;
};

// This replaces the "LegacyForms.SecretFormField" component from @grafana/ui, so we can start using the newer form components.
export const SecretInput = ({ isConfigured, onReset, ...props }: SecretInputProps) => {
  if (isConfigured) {
    return (
      <HorizontalGroup>
        <Input {...props} type="text" disabled={true} value="configured" />
        <Button onClick={onReset} variant="secondary">
          Reset
        </Button>
      </HorizontalGroup>
    );
  }

  return <Input {...props} type="password" />;
};
