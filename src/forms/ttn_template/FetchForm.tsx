import React from 'react';
import { ThingsNetworkApplicationSettings } from '../../types';
import { Button, Field, FormAPI, HorizontalGroup, Input, InputControl, RadioButtonGroup, } from '@grafana/ui';

export type formValues = {
  zone: string;
  app: string;
  token: string;
};

export interface TtnProps extends FormAPI<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (formValues: formValues) => void;
}

export const TtnResource = ({ register, control, watch, errors }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');

  return (
    <>
      <HorizontalGroup align={'flex-start'}>
        <Field label="Zone" >
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

        <Field
          label="Authorization Key"
          invalid={!!errors.authorizationKey}
          error={errors?.authorizationKey && errors?.authorizationKey.message}
        >

          <Input
            {...register('authorizationKey', {
              required: 'Authorization key is required'
            })}
            defaultValue={authorizationKey ?? ''}
            placeholder={'Authorization Key'}
          />
        </Field>

        <Field
          label="Application"
          invalid={!!errors.application}
          error={errors.application && errors.application.message}
        >
          <Input
            {...register('application', { required: 'Application is required' })}
            placeholder={'Application'}
            defaultValue={application ?? ''}
          />
        </Field>

        {/* Fetch Devices */}
        <Button
          name="submit"
          style={{ marginTop: '18px' }}
          type="submit"
          variant={'primary'}
          icon={'download-alt'}
        >
          {'Fetch devices'}
        </Button>
      </HorizontalGroup>
    </>
  );
};
