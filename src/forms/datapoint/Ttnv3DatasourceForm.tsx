import React, { FC } from 'react';
import { DatapointSettings, Ttnv3Datasource } from '../../types';
import { Field, FormAPI, Input } from '@grafana/ui';
import { FieldErrors } from 'react-hook-form';

interface Props extends FormAPI<DatapointSettings> {
  datasource?: Ttnv3Datasource;
}

export const Ttnv3DatasourceForm: FC<Props> = ({ unregister, register, errors }) => {
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
        />
      </Field>

      <Field label="Device" invalid={!!dsErrors?.device} error={dsErrors?.device && dsErrors?.device.message}>
        <Input
          {...register('datasource.device', {
            required: 'Device is required',
          })}
          placeholder="Device"
        />
      </Field>

      <Field label="Point" invalid={!!dsErrors?.point} error={dsErrors?.point && dsErrors?.point.message}>
        <Input
          {...register('datasource.point', {
            required: 'Point is required',
          })}
          placeholder="Point"
        />
      </Field>

      <Field
        label="Authorization Key"
        invalid={!!dsErrors?.authorizationkey}
        error={dsErrors?.authorizationkey && dsErrors?.authorizationkey.message}
      >
        <Input
          {...register('datasource.authorizationkey', {
            required: 'Key is required',
          })}
          placeholder="Key"
        />
      </Field>
    </>
  );
};
