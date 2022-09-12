import React, { FC } from 'react';
import {
  Authentication,
  AuthenticationType,
  NoAuthentication,
  OriginDocumentFormat,
  TimestampSelection,
  TimestampType,
  WebResourceSettings,
} from '../types';
import { Button, Field, Form, HorizontalGroup, Input, InputControl, RadioButtonGroup } from '@grafana/ui';
import { useForm, UseFormReturn } from 'react-hook-form';
import { TimestampSelector } from '../components/TimestampSelector';
import { AuthenticationSelector } from '../components/AuthenticationSelector';

interface Props {
  resource?: WebResourceSettings;
  project: string;
  onSubmit: (data: WebResourceSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

export const WebResourceForm: FC<Props> = ({ resource, onSubmit, onCancel }) => {
  let dsForm = useForm<WebResourceSettings>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: resource ?? {
      url: '',
      authentication: {} as NoAuthentication,
      format: OriginDocumentFormat.jsondoc,
      timestampSelection: {
        timestampType: TimestampType.polltime,
        timestampExpression: '',
      },
    },
  });

  return (
    <Form<WebResourceSettings>
      onSubmit={onSubmit}
      defaultValues={{
        ...resource,
      }}
    >
      {() => {
        return (
          <>
            <WebResource resource={resource} {...(dsForm as UseFormReturn<WebResourceSettings>)} />
            <HorizontalGroup>
              <Button type="button" variant={'secondary'} onClick={onCancel}>
                {'Cancel'}
              </Button>
              <Button type="submit">{!!resource ? 'Update' : 'Save'}</Button>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

interface WebResourceProps extends UseFormReturn<WebResourceSettings> {
  resource?: WebResourceSettings;
}

const WebResource: FC<WebResourceProps> = ({ resource, control, watch, register, formState: { errors } }) => {
  const format = watch('format');
  let tsApi = useForm<TimestampSelection>({
    defaultValues: resource
      ? resource.timestampSelection
      : {
          timestampType: TimestampType.polltime,
          timestampExpression: '',
        },
  });
  let authApi = useForm<Authentication>({
    defaultValues: resource
      ? resource.authentication
      : ({ authenticationType: AuthenticationType.none } as NoAuthentication),
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
        auth={
          resource ? resource?.authentication : ({ authenticationType: AuthenticationType.none } as NoAuthentication)
        }
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
      </HorizontalGroup>
      <TimestampSelector format={format} {...(tsApi as UseFormReturn<TimestampSelection>)} />
    </>
  );
};
