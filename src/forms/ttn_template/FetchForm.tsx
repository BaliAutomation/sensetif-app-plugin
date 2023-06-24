import React from 'react';
import { ThingsNetworkApplicationSettings } from '../../types';
import { Button, Checkbox, Field, FormAPI, HorizontalGroup, Input, InputControl, RadioButtonGroup, SecretInput } from '@grafana/ui';

export interface TtnProps extends FormAPI<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
}

export const TtnResource = ({ register, control, watch, errors }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');
  const fPort = watch('fPort');

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

          <SecretInput
            {...register('authorizationKey', {
              required: 'Authorization key is required'
            })}
            isConfigured={false}
            onReset={() => { }}
            autoComplete='current-password'
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

        <Field
          label="fPort"
          invalid={!!errors.fPort}
          error={errors.fPort && errors.fPort.message}
        >
          <Input
            {...register('fPort')}
            placeholder={'fPort'}
            defaultValue={fPort ?? ''}
          />
        </Field>

        <Field
          label="Limit fetched messages"
        >
          <InputControl
            render={({ field: { ref, ...field } }) => (
              <Checkbox
                {...field}
              />
            )}
            control={control}
            defaultValue={true}
            name="limitFetchedMessages"
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
