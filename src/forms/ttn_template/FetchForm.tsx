import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../../types';
import { Button, Field, HorizontalGroup, Input, InputControl, RadioButtonGroup } from '@grafana/ui';

export type formValues = {
  zone: string;
  app: string;
  token: string;
};

export interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (formValues: formValues) => void;
}

export const TtnResource = ({ onSubmit, control, watch, formState: { errors } }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');

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

        <Field
          label="Authorization Key"
          invalid={!!errors?.authorizationKey}
          error={errors?.authorizationKey && errors?.authorizationKey.message}
        >
          <InputControl
            render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Authorization Key" />}
            control={control}
            rules={{ required: { value: true, message: 'Required.' } }}
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
            rules={{ required: { value: true, message: 'Required.' } }}
            name="application"
            defaultValue={application ?? ''}
          />
        </Field>

        {/* Fetch Devices */}
        <Button
          type="button"
          variant={'secondary'}
          onClick={() => {
            onSubmit({
              app: application,
              token: authorizationKey,
              zone: zone,
            });
          }}
        >
          {'Fetch devices'}
        </Button>
      </HorizontalGroup>
    </>
  );
};
