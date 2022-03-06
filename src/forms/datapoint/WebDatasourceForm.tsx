import React, { FC } from 'react';
import { AuthenticationType, OriginDocumentFormat, TimestampType, WebDatasource } from '../../types';
import { Field, HorizontalGroup, Input, InputControl, RadioButtonGroup, Select } from '@grafana/ui';
import { UseFormReturn } from 'react-hook-form';

interface Props extends UseFormReturn<WebDatasource> {}

export const defaultValues: WebDatasource = {
  url: '',
  authenticationType: AuthenticationType.none,
  format: OriginDocumentFormat.jsondoc,
  timestampType: TimestampType.epochMillis,
  timestampExpression: '',
  valueExpression: '',
};

export const WebDatasourceForm: FC<Props> = ({ control, watch, register, formState: { errors } }) => {
  const timestampType = watch('timestampType');
  const authType = watch('authenticationType');
  const format = watch('format');

  return (
    <>
      <Field label="URL" invalid={!!errors?.url} error={errors?.url && errors?.url.message}>
        <InputControl
          render={({ field: { ref, ...field } }) => <Input {...field} type="url" placeholder="Datapoint URL" />}
          control={control}
          name="url"
          defaultValue={''}
        />
      </Field>

      <Field label="Authentication type">
        <InputControl
          render={({ field: { ref, ...field } }) => (
            <RadioButtonGroup
              {...field}
              options={[
                { label: 'None', value: AuthenticationType.none },
                { label: 'User & Password', value: AuthenticationType.basic },
                { label: 'Bearer Token', value: AuthenticationType.bearerToken },
              ]}
            />
          )}
          rules={{
            required: 'Auth selection is required',
          }}
          control={control}
          defaultValue={authType ?? AuthenticationType.none}
          name="authenticationType"
        />
      </Field>

      {authType === AuthenticationType.basic && (
        <>
          {/*<HorizontalGroup>*/}
          <Field label="Username:Password" invalid={!!errors?.auth} error={errors?.auth && errors?.auth.message}>
            <Input
              {...register('auth', {
                required: 'Username:Password is required',
              })}
              placeholder="Username:Password"
            />
          </Field>
        </>
      )}
      {authType === AuthenticationType.bearerToken && (
        <>
          <Field label="Token" invalid={!!errors?.auth} error={errors?.auth && errors?.auth.message}>
            <Input
              {...register('auth', {
                required: 'Token is required',
              })}
              placeholder="Bearer Token"
            />
          </Field>
        </>
      )}
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
          label={format === OriginDocumentFormat.xmldoc ? 'XPath' : 'JSON Path'}
          invalid={!!errors?.valueExpression}
          error={errors?.valueExpression && errors?.valueExpression.message}
        >
          <Input
            {...register('valueExpression', {
              required: 'expression is required',
            })}
            placeholder={format === OriginDocumentFormat.xmldoc ? 'XPath' : 'JSON Path'}
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
                onChange={(selectable) => onChange(selectable.value)}
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
            defaultValue={TimestampType.polltime}
            name="timestampType"
          />
        </Field>
        {timestampType && timestampType !== TimestampType.polltime && (
          <Field
            label={
              format === OriginDocumentFormat.xmldoc
                ? 'XPath Expression for Timestamp'
                : 'JSON Path Expression for Timestamp'
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
