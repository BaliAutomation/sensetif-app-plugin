import React, { FC } from 'react';
import { DatapointSettings, Ttnv3Datasource } from '../../types';
import { Field, FormAPI, Input } from '@grafana/ui';
import { FieldErrors } from 'react-hook-form';

interface Props extends FormAPI<DatapointSettings> {
  datasource?: Ttnv3Datasource;
}

export const Ttnv3DatasourceForm: FC<Props> = ({
  setValue,
  unregister,
  control,
  watch,
  register,
  errors,
  datasource,
}) => {
  const dsErrors = errors.datasource as FieldErrors<Ttnv3Datasource>;

  React.useEffect(() => {
    unregister('datasource');
  }, [unregister]);

  return (
    <>
      <Field label="Zone" invalid={!!dsErrors?.zone} error={dsErrors?.zone && dsErrors?.zone.message}>
        <Input
          {...register('datasource.zone', {
            required: 'Zone is required',
          })}
          placeholder="Zone"
          css=""
        />
      </Field>

      <Field
        label="Application"
        invalid={!!dsErrors?.application}
        error={dsErrors?.application && dsErrors?.application.message}
      >
        <Input
          {...register('datasource.application', {
            required: 'Application is required',
          })}
          placeholder="Application"
          css=""
        />
      </Field>

      <Field label="Device" invalid={!!dsErrors?.device} error={dsErrors?.device && dsErrors?.device.message}>
        <Input
          {...register('datasource.device', {
            required: 'Device is required',
          })}
          placeholder="Device"
          css=""
        />
      </Field>

      <Field
        label="Pointname"
        invalid={!!dsErrors?.pointname}
        error={dsErrors?.pointname && dsErrors?.pointname.message}
      >
        <Input
          {...register('datasource.pointname', {
            required: 'Pointname is required',
          })}
          placeholder="Pointname"
          css=""
        />
      </Field>

      <Field
        label="Authorization Key"
        invalid={!!dsErrors?.authorizationKey}
        error={dsErrors?.authorizationKey && dsErrors?.authorizationKey.message}
      >
        <Input
          {...register('datasource.authorizationKey', {
            required: 'Key is required',
          })}
          placeholder="Key"
          css=""
        />
      </Field>
    </>
  );
};
