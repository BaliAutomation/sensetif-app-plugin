import React, { FC } from 'react';
import { Ttnv3Datasource } from '../../types';
import { Field, Input } from '@grafana/ui';
import { UseFormReturn } from 'react-hook-form';

interface Props extends UseFormReturn<Ttnv3Datasource> {
  ds?: Ttnv3Datasource;
}

export const defaultValues: Ttnv3Datasource = {
  application: '',
  authorizationkey: '',
  device: '',
  point: '',
  fport: -1,
  zone: '',
  poll: true,
  subscribe: false,
  webhook: false,
};

export const Ttnv3DatasourceForm: FC<Props> = ({ register, formState: { errors } }) => {
  return (
    <>
      <Field label="Zone" invalid={!!errors?.zone} error={errors?.zone && errors?.zone.message}>
        <Input
          {...register('zone', {
            required: 'Zone is required',
          })}
          placeholder="Zone"
        />
      </Field>

      <Field
        label="Application"
        invalid={!!errors?.application}
        error={errors?.application && errors?.application.message}
      >
        <Input
          {...register('application', {
            required: 'Application is required',
          })}
          placeholder="Application"
        />
      </Field>

      <Field label="Device" invalid={!!errors?.device} error={errors?.device && errors?.device.message}>
        <Input
          {...register('device', {
            required: 'Device is required',
          })}
          placeholder="Device"
        />
      </Field>

      <Field label="Point" invalid={!!errors?.point} error={errors?.point && errors?.point.message}>
        <Input
          {...register('point', {
            required: 'Point is required',
          })}
          placeholder="Point"
        />
      </Field>

      <Field label="F_Port" invalid={!!errors?.fport} error={errors?.fport && errors?.fport.message}>
        <Input {...register('fport', {})} placeholder="Filter by f_port. -1 for all f_port values." />
      </Field>

      <Field
        label="Authorization Key"
        invalid={!!errors?.authorizationkey}
        error={errors?.authorizationkey && errors?.authorizationkey.message}
      >
        <Input
          {...register('authorizationkey', {
            required: 'Key is required',
          })}
          placeholder="Key"
        />
      </Field>
    </>
  );
};
