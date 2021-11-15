import React, { FC } from 'react';
import { AuthenticationType, DatapointSettings, OriginDocumentFormat, TimestampType, WebDatasource } from '../../types';
import { Field, FormAPI, HorizontalGroup, Input, InputControl, RadioButtonGroup, Select } from '@grafana/ui';
import { FieldErrors } from 'react-hook-form';

interface Props extends FormAPI<DatapointSettings> {
  datasource?: WebDatasource;
}

export const WebDatasourceForm: FC<Props> = ({
  setValue,
  unregister,
  control,
  watch,
  register,
  errors,
  datasource,
}) => {
  const dsErrors = errors.datasource as FieldErrors<WebDatasource>;

  const timestampType = watch('datasource.timestampType');
  const authType = watch('datasource.authenticationType');
  const format = watch('datasource.format');

  React.useEffect(() => {
    unregister('datasource');
  }, [unregister]);

  React.useEffect(() => {
    authType === AuthenticationType.none && unregister('datasource.auth');
  }, [authType, unregister]);

  return (
    <>
      <Field label="URL" invalid={!!dsErrors?.url} error={dsErrors?.url && dsErrors?.url.message}>
        <InputControl
          render={({ field }) => <Input {...field} type="url" placeholder="Datapoint URL" />}
          control={control}
          name="datasource.url"
        />
      </Field>

      <Field label="Authentication type">
        <InputControl
          render={({ field }) => (
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
          defaultValue={datasource ? datasource.authenticationType : AuthenticationType.none}
          name="datasource.authenticationType"
        />
      </Field>

      {authType === AuthenticationType.basic && (
        <>
          {/*<HorizontalGroup>*/}
          <Field label="Username:Password" invalid={!!dsErrors?.auth} error={dsErrors?.auth && dsErrors?.auth.message}>
            <Input
              {...register('datasource.auth', {
                required: 'Username:Password is required',
              })}
              placeholder="Username:Password"
            />
          </Field>
          {/*<Field*/}
          {/*  label="Password"*/}
          {/*  invalid={!!dsErrors?.auth?.p}*/}
          {/*  error={dsErrors?.auth?.p && dsErrors?.auth.p.message}*/}
          {/*>*/}
          {/*  <Input*/}
          {/*    css=""*/}
          {/*    {...register('datasource.auth.p', {*/}
          {/*      required: 'Password is required',*/}
          {/*    })}*/}
          {/*    type="password"*/}
          {/*    placeholder="Password"*/}
          {/*  />*/}
          {/*</Field>*/}
          {/*</HorizontalGroup>*/}
        </>
      )}
      {authType === AuthenticationType.bearerToken && (
        <>
          <Field label="Token" invalid={!!dsErrors?.auth} error={dsErrors?.auth && dsErrors?.auth.message}>
            <Input
              {...register('datasource.auth', {
                required: 'Token is required',
              })}
              placeholder="Username"
            />
          </Field>
        </>
      )}
      <Field label="Document Format">
        <InputControl
          render={({ field }) => (
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
          defaultValue={datasource ? datasource.format : OriginDocumentFormat.jsondoc}
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
