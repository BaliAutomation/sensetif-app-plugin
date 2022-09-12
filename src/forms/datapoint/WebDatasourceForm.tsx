import React, { FC } from 'react';
import {
  Authentication,
  AuthenticationType,
  NoAuthentication,
  OriginDocumentFormat,
  TimestampSelection,
  TimestampType,
  WebDatasource,
} from '../../types';
import { Field, HorizontalGroup, Input, InputControl, RadioButtonGroup } from '@grafana/ui';
import { useForm, UseFormReturn } from 'react-hook-form';
import { AuthenticationSelector } from '../../components/AuthenticationSelector';
import { TimestampSelector } from '../../components/TimestampSelector';

interface Props extends UseFormReturn<WebDatasource> {
  ds?: WebDatasource;
}

export const defaultValues: WebDatasource = {
  url: '',
  auth: {} as NoAuthentication,
  format: OriginDocumentFormat.jsondoc,
  timestampSelection: {
    timestampType: TimestampType.polltime,
    timestampExpression: '',
  },
  valueExpression: '',
};

export const WebDatasourceForm: FC<Props> = ({ ds, control, watch, register, formState: { errors } }) => {
  const format = watch('format');
  let tsApi = useForm<TimestampSelection>({
    defaultValues: ds
      ? ds.timestampSelection
      : {
          timestampType: TimestampType.polltime,
          timestampExpression: '',
        },
  });
  let authApi = useForm<Authentication>({
    defaultValues: ds ? ds.auth : ({ authenticationType: AuthenticationType.none } as NoAuthentication),
  });

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
      <AuthenticationSelector
        auth={ds ? ds.auth : ({ authenticationType: AuthenticationType.none } as NoAuthentication)}
        {...authApi}
      />
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
      <TimestampSelector format={format} {...tsApi} />
    </>
  );
};
