import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../../types';
import { Button, Field, HorizontalGroup, Input, InputControl, RadioButtonGroup } from '@grafana/ui';
// import { AvailablePollIntervals } from 'utils/consts';

export type formValues = {
  zone: string;
  app: string;
  token: string;
  // pollInterval: PollInterval;
};

export interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (formValues: formValues) => void;
}

export const TtnResource = ({ onSubmit, control, watch, formState: { errors } }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');
  // const pollInterval = watch('pollinterval');

  return (
    <>
      <HorizontalGroup>
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

        {/* <Field
          label="Poll interval"
          invalid={!!errors.pollinterval}
          error={errors.pollinterval && errors.pollinterval.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(selectable) => onChange(selectable.value)}
                options={AvailablePollIntervals}
              />
            )}
            rules={{
              required: 'Interval selection is required',
            }}
            name="pollinterval"
            control={control}
            defaultValue={AvailablePollIntervals[5].value}
          />
        </Field> */}

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
          onClick={() => {
            // onSubmit(authorizationKey, application, zone);
            onSubmit({
              app: application,
              token: authorizationKey,
              zone: zone,
              // pollInterval: pollInterval,
            });
          }}
        >
          {'Fetch devices'}
        </Button>
      </HorizontalGroup>
    </>
  );
};
