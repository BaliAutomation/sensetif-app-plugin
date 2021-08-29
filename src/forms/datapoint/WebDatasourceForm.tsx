import React, { FC } from 'react';
import { AuthenticationType, DatapointSettings, OriginDocumentFormat, TimestampType, WebDatasource } from '../../types';
import { Field, FieldSet, FormAPI, Input, InputControl, RadioButtonGroup, Select } from '@grafana/ui';
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
  const defaultValues: Partial<WebDatasource> = datasource ?? {
    authenticationType: AuthenticationType.none,
    format: OriginDocumentFormat.jsondoc,
    timestampType: TimestampType.polltime,
  };

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
      <FieldSet label="Web Datasource">
        <Field label="URL" invalid={!!dsErrors?.url} error={dsErrors?.url && dsErrors?.url.message}>
          <Input
            {...register('datasource.url', {
              required: 'URL is required',
            })}
            type="url"
            placeholder="Datapoint URL"
            css=""
          />
        </Field>

        <FieldSet label="Authorization">
          <Field label="Authentication type">
            <InputControl
              render={({ field }) => (
                <RadioButtonGroup
                  {...field}
                  options={[
                    { label: 'None', value: AuthenticationType.none },
                    { label: 'User & Password', value: AuthenticationType.basic },
                  ]}
                />
              )}
              rules={{
                required: 'Auth selection is required',
              }}
              control={control}
              defaultValue={defaultValues.authenticationType}
              name="datasource.authenticationType"
            />
          </Field>

          {authType === AuthenticationType.basic && (
            <>
              <Field
                label="Username"
                invalid={!!dsErrors?.auth?.u}
                error={dsErrors?.auth?.u && dsErrors?.auth.u.message}
              >
                <Input
                  css=""
                  {...register('datasource.auth.u', {
                    required: 'Username is required',
                  })}
                  placeholder="Username"
                />
              </Field>
              <Field
                label="Password"
                invalid={!!dsErrors?.auth?.p}
                error={dsErrors?.auth?.p && dsErrors?.auth.p.message}
              >
                <Input
                  css=""
                  {...register('datasource.auth.p', {
                    required: 'Password is required',
                  })}
                  type="password"
                  placeholder="Password"
                />
              </Field>
            </>
          )}
        </FieldSet>

        <FieldSet label="Document Format">
          <Field label="Format">
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
              defaultValue={defaultValues.format}
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
              css={''}
              placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
            />
          </Field>
        </FieldSet>

        <FieldSet label="Timestamp">
          <Field
            label="Type"
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
              label={format === OriginDocumentFormat.jsondoc ? 'JSON Path Expression' : 'XPath Expression'}
              invalid={!!dsErrors?.timestampExpression}
              error={dsErrors?.timestampExpression && dsErrors?.timestampExpression.message}
            >
              <Input
                {...register('datasource.timestampExpression', {})}
                placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
                css=""
              />
            </Field>
          )}
        </FieldSet>
      </FieldSet>
    </>
  );
};
