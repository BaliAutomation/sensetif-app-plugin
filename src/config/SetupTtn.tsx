import React, { useState, ChangeEvent } from 'react';
import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';
import { Alert, Button, Field } from '@grafana/ui';
import { SensetifAppSettings } from 'types';
import { SecretInput } from './SecretInput';
import { updatePluginAndReload } from './utils';

type State = {
  // Tells us if the API key secret is set.
  // Set to `true` ONLY if it has already been set and haven't been changed.
  // (We unfortunately need an auxiliray variable for this, as `secureJsonData` is never exposed to the browser after it is set)
  isTtnApiKeySet: boolean;
  // An secret key for our custom API.
  ttnApiKey: string;
};

interface Props extends PluginConfigPageProps<AppPluginMeta<SensetifAppSettings>> {}

export const SetupTtn = ({ plugin }: Props) => {
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
      <pre>
        configured hosts:
        {JSON.stringify(jsonData?.ttnHosts, null, ' ')}
      </pre>
      <br></br>
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
                  ttnApiKey: state.ttnApiKey,
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
