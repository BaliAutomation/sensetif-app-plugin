import React, { FC } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { MqttClientSettings } from '../types';
import { Button, Field, Form, HorizontalGroup, Input, InputControl, Select } from '@grafana/ui';
import { AvailableMqttConnectionTypes } from '../consts';

interface Props {
  mqtt?: MqttClientSettings;
  onSubmit: (data: MqttClientSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

export const MqttClientResourceForm: FC<Props> = ({ mqtt, onSubmit, onCancel }) => {
  let mqttForm = useForm<MqttClientSettings>({});
  return (
    <Form<MqttClientSettings>
      onSubmit={onSubmit}
      defaultValues={{
        ...mqtt,
      }}
    >
      {() => {
        return (
          <>
            <MqttResource mqtt={mqtt} {...mqttForm} />
            <HorizontalGroup>
              <Button type="button" variant={'secondary'} onClick={onCancel}>
                {'Cancel'}
              </Button>
              <Button type="submit">{!!mqtt ? 'Update' : 'Save'}</Button>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

interface MqttProps extends UseFormReturn<MqttClientSettings> {
  mqtt?: MqttClientSettings;
}

const MqttResource: FC<MqttProps> = ({ control, watch, formState: { errors } }) => {
  const host = watch('host');
  const port = watch('port');

  return (
    <>
      <HorizontalGroup>
        <Field
          label="Connection Type"
          invalid={!!errors?.connection}
          error={errors?.connection && errors?.connection.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(selectable) => onChange(selectable.value)}
                options={AvailableMqttConnectionTypes}
              />
            )}
            rules={{
              required: 'Connection Type is required',
            }}
            control={control}
            defaultValue={AvailableMqttConnectionTypes[0].value}
            name="connection"
          />
        </Field>
      </HorizontalGroup>
      <Field label="Host" invalid={!!errors?.host} error={errors?.host && errors?.host.message}>
        <InputControl
          render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Authorization Key" />}
          control={control}
          name="host"
          defaultValue={host ?? ''}
        />
      </Field>
      <Field label="Port" invalid={!!errors?.port} error={errors?.port && errors?.port.message}>
        <InputControl
          render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Application" />}
          control={control}
          name="port"
          defaultValue={port ?? ''}
        />
      </Field>
    </>
  );
};
