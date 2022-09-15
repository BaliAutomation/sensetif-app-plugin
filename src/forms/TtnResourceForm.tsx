import React, { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../types';
import { Button, Field, Form, HorizontalGroup, Input, Select, InputControl, RadioButtonGroup } from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';

interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (data: ThingsNetworkApplicationSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});
  return (
    <Form<ThingsNetworkApplicationSettings>
      onSubmit={onSubmit}
      defaultValues={{
        ...ttn,
      }}
    >
      {() => {
        return (
          <>
            <TtnResource ttn={ttn} {...ttnForm} />
            <HorizontalGroup>
              <Button type="button" variant={'secondary'} onClick={onCancel}>
                {'Cancel'}
              </Button>
              <Button type="submit">{!!ttn ? 'Update' : 'Save'}</Button>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
}

const TtnResource = ({ control, watch, formState: { errors } }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');

  type State = {
    devices?: any[];
  };
  const [state, setState] = useState<State>();

  return (
    <>
      <HorizontalGroup>
        <Field label="Zone">
          <InputControl
            render={({ field: { ref, ...field } }) => (
              <RadioButtonGroup
                {...field}
                options={[
                  { label: 'eu1', value: 'eu1' },
                  { label: 'nam1', value: 'nam1' },
                  { label: 'au1', value: 'au1' },
                ]}
              />
            )}
            rules={{
              required: 'Zone is required',
            }}
            control={control}
            defaultValue={zone ?? 'eu1'}
            name="zone"
          />
        </Field>
      </HorizontalGroup>

      <Field
        label="Poll interval"
        invalid={!!errors.pollinterval}
        error={errors.pollinterval && errors.pollinterval.message}
      >
        <InputControl
          render={({ field: { onChange, ref, ...field } }) => (
            <Select {...field} onChange={(selectable) => onChange(selectable.value)} options={AvailablePollIntervals} />
          )}
          rules={{
            required: 'Interval selection is required',
          }}
          name="pollinterval"
          control={control}
          defaultValue={AvailablePollIntervals[5].value}
        />
      </Field>

      <Field
        label="Authorization Key"
        invalid={!!errors?.authorizationKey}
        error={errors?.authorizationKey && errors?.authorizationKey.message}
      >
        <InputControl
          render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Authorization Key" />}
          control={control}
          name="authorizationKey"
          defaultValue={authorizationKey ?? ''}
        />
      </Field>
      <Field
        label="Application"
        invalid={!!errors?.application}
        error={errors?.application && errors?.application.message}
      >
        <InputControl
          render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Application" />}
          control={control}
          name="application"
          defaultValue={application ?? ''}
        />
      </Field>

      {/* Fetch Devices */}
      <Button
        type="button"
        variant={'secondary'}
        onClick={async () => {
          const devices = await fetchDevices(zone, application);
          setState({
            devices: devices,
          });
        }}
      >
        {'Fetch devices'}
      </Button>

      <br></br>
      <h1>devices::</h1>
      <pre>{JSON.stringify(state, null, ' ')}</pre>
    </>
  );
};

const fetchDevices = async (zone: string, app_id: string) => {
  const baseURL = '/api/plugin-proxy/sensetif-app/eu1_thethings';

  const devicesResponse = await fetch(`${baseURL}/api/v3/applications/${app_id}/devices`).then((r) => r.json());

  console.log('fetched devices:');
  console.log(devicesResponse);

  return devicesResponse['end_devices'];
};
