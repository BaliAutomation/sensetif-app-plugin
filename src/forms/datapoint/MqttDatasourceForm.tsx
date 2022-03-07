import React, { FC } from 'react';
import { MqttDatasource, MqttProtocol, OriginDocumentFormat, TimestampType } from '../../types';
import { Field, HorizontalGroup, Input, InputControl, RadioButtonGroup, Select } from '@grafana/ui';
import { UseFormReturn } from 'react-hook-form';

interface Props extends UseFormReturn<MqttDatasource> {
  ds?: MqttDatasource;
}

export const defaultValues: MqttDatasource = {
  address: '',
  topic: '',
  port: 1883,
  username: '',
  password: '',
  valueExpression: '',
  timestampExpression: '',
  format: OriginDocumentFormat.jsondoc,
  timestampType: TimestampType.polltime,
  protocol: MqttProtocol.tcp,
};

export const MqttDatasourceForm: FC<Props> = ({ control, watch, register, formState: { errors } }) => {
  const timestampType = watch('timestampType');
  const format = watch('format');
  const protocol = watch('protocol');

  return (
    <>
      <Field label="Address" invalid={!!errors?.address} error={errors?.address && errors?.address.message}>
        <Input
          {...register('address', {
            required: 'Address is required',
          })}
          placeholder="MQTT broker address or IP number"
        />
      </Field>
      <Field label="Port" invalid={!!errors?.port} error={errors?.port && errors?.port.message}>
        <Input
          {...register('port', {
            required: 'Port is required',
          })}
          placeholder="MQTT broker port number"
          defaultValue={protocol === MqttProtocol.tls ? 8883 : 1883}
        />
      </Field>
      <Field label="MQTT protocol">
        <InputControl
          render={({ field: { ref, ...field } }) => (
            <RadioButtonGroup
              {...field}
              options={[
                { label: 'tcp', value: MqttProtocol.tcp },
                { label: 'tls', value: MqttProtocol.tls },
              ]}
            />
          )}
          rules={{
            required: 'MQTT transport protocol is required.',
          }}
          control={control}
          defaultValue={protocol ?? MqttProtocol.tcp}
          name="protocol"
        />
      </Field>
      <Field label="Topic" invalid={!!errors?.topic} error={errors?.topic && errors?.topic.message}>
        <Input
          {...register('topic', {
            required: 'Topic is required',
          })}
          placeholder="MQTT topic, example: /public/weather/temperature"
        />
      </Field>
      <Field label="Username" invalid={!!errors?.username} error={errors?.username && errors?.username.message}>
        <Input {...register('username')} placeholder="Username at the MQTT broker" defaultValue={''} />
      </Field>
      <Field label="Password" invalid={!!errors?.password} error={errors?.password && errors?.password.message}>
        <Input {...register('password')} placeholder="Password of the user at the MQTT broker" defaultValue={''} />
      </Field>
      <HorizontalGroup>
        <Field label="Document Format">
          <InputControl
            render={({ field: { ref, ...field } }) => (
              <RadioButtonGroup
                {...field}
                options={[
                  { label: 'json', value: OriginDocumentFormat.jsondoc },
                  { label: 'xml', value: OriginDocumentFormat.xmldoc },
                ]}
              />
            )}
            rules={{
              required: 'Format selection is required',
            }}
            control={control}
            defaultValue={format ?? OriginDocumentFormat.jsondoc}
            name="format"
          />
        </Field>
        <Field
          label={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
          invalid={!!errors?.valueExpression}
          error={errors?.valueExpression && errors?.valueExpression.message}
        >
          <Input
            {...register('valueExpression', {
              required: 'expression is required',
            })}
            placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
          />
        </Field>
      </HorizontalGroup>
      <HorizontalGroup>
        <Field
          label="Type of Timestamp"
          invalid={!!errors?.timestampType}
          error={errors?.timestampType && errors?.timestampType.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(value) => onChange(value.value)}
                options={[
                  { label: 'Poll Time', value: TimestampType.polltime },
                  { label: 'Milliseconds', value: TimestampType.epochMillis },
                  { label: 'Seconds', value: TimestampType.epochSeconds },
                  { label: 'ISO8601 with Timezone', value: TimestampType.iso8601_zoned },
                  { label: 'ISO8601 with Offset', value: TimestampType.iso8601_offset },
                ]}
              />
            )}
            rules={{
              required: 'Timestamp Type selection is required',
            }}
            control={control}
            defaultValue={TimestampType.epochMillis}
            name="timestampType"
          />
        </Field>
        {timestampType !== TimestampType.polltime && (
          <Field
            label={
              format === OriginDocumentFormat.jsondoc
                ? 'JSON Path Expression for Timestamp'
                : 'XPath Expression for Timestamp'
            }
            invalid={!!errors?.timestampExpression}
            error={errors?.timestampExpression && errors?.timestampExpression.message}
          >
            <Input
              {...register('timestampExpression', {})}
              placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
            />
          </Field>
        )}
      </HorizontalGroup>
    </>
  );
};
