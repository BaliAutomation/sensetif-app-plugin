import React, { FC } from 'react';
import {
  AuthenticationType,
  DatapointSettings,
  MqttDatasource,
  MqttProtocol,
  OriginDocumentFormat,
  TimestampType,
} from '../../types';
import { Field, FormAPI, HorizontalGroup, Input, InputControl, RadioButtonGroup, Select } from '@grafana/ui';
import { FieldErrors } from 'react-hook-form';

interface Props extends FormAPI<DatapointSettings> {
  ds?: MqttDatasource;
}

export const MqttDatasourceForm: FC<Props> = ({ unregister, control, watch, register, errors, ds }) => {
  const dsErrors = errors.datasource as FieldErrors<MqttDatasource>;
  const timestampType = watch('datasource.timestampType');
  const authType = watch('datasource.authenticationType');
  const format = watch('datasource.format');

  React.useEffect(() => {
    unregister('datasource');
  }, [unregister]);

  React.useEffect(() => {
    authType === AuthenticationType.none && unregister('datasource.password') && unregister('datasource.username');
  }, [authType, unregister]);

  return (
    <>
      <Field label="Address" invalid={!!dsErrors?.address} error={dsErrors?.address && dsErrors?.address.message}>
        <Input
          {...register('datasource.address', {
            required: 'Address is required',
          })}
          placeholder="MQTT broker address or IP number"
        />
      </Field>
      <Field label="Port" invalid={!!dsErrors?.port} error={dsErrors?.port && dsErrors?.port.message}>
        <Input
          {...register('datasource.port', {
            required: 'Port is required',
          })}
          placeholder="MQTT broker port number"
          defaultValue={ds?.protocol === MqttProtocol.tls ? 8883 : 1883}
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
          defaultValue={ds ? ds.protocol : MqttProtocol.tcp}
          name="datasource.protocol"
        />
      </Field>
      <Field label="Topic" invalid={!!dsErrors?.topic} error={dsErrors?.topic && dsErrors?.topic.message}>
        <Input
          {...register('datasource.topic', {
            required: 'Topic is required',
          })}
          placeholder="MQTT topic, example: /public/weather/temperature"
        />
      </Field>
      <Field label="Username" invalid={!!dsErrors?.username} error={dsErrors?.username && dsErrors?.username.message}>
        <Input {...register('datasource.username')} placeholder="Username at the MQTT broker" defaultValue={''} />
      </Field>
      <Field label="Password" invalid={!!dsErrors?.password} error={dsErrors?.password && dsErrors?.password.message}>
        <Input
          {...register('datasource.password')}
          placeholder="Password of the user at the MQTT broker"
          defaultValue={''}
        />
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
            defaultValue={ds ? ds.format : OriginDocumentFormat.jsondoc}
            name="datasource.format"
          />
        </Field>
        <Field
          label={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
          invalid={!!dsErrors?.valueExpression}
          error={dsErrors?.valueExpression && dsErrors?.valueExpression.message}
        >
          <Input
            {...register('datasource.valueExpression', {
              required: 'expression is required',
            })}
            placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
          />
        </Field>
      </HorizontalGroup>
      <HorizontalGroup>
        <Field
          label="Type of Timestamp"
          invalid={!!dsErrors?.timestampType}
          error={dsErrors?.timestampType && dsErrors?.timestampType.message}
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
            name="datasource.timestampType"
          />
        </Field>
        {timestampType !== TimestampType.polltime && (
          <Field
            label={
              format === OriginDocumentFormat.jsondoc
                ? 'JSON Path Expression for Timestamp'
                : 'XPath Expression for Timestamp'
            }
            invalid={!!dsErrors?.timestampExpression}
            error={dsErrors?.timestampExpression && dsErrors?.timestampExpression.message}
          >
            <Input
              {...register('datasource.timestampExpression', {})}
              placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
            />
          </Field>
        )}
      </HorizontalGroup>
    </>
  );
};
