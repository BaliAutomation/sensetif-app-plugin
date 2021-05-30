import React, { FC } from 'react';
import { DatapointSettings, OriginDocumentFormat } from '../types';
import { Button, Field, FieldSet, Form, Input, InputControl, RadioButtonGroup } from '@grafana/ui';

interface Props {
  editable?: boolean;
  datapoint?: DatapointSettings;
  onSubmit: (data: DatapointSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const DatapointForm: FC<Props> = ({ editable, datapoint, onSubmit }) => {
  return (
    <Form<DatapointSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: datapoint?.name,
        format: datapoint?.format,
        url: datapoint?.url,
        unit: datapoint?.unit,
        jsonxpath: datapoint?.jsonxpath,
      }}
    >
      {({ register, errors, control }) => {
        return (
          <>
            <FieldSet label="Datapoint details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  disabled={!editable}
                  placeholder="Datapoint name"
                  name="name"
                  ref={register({
                    required: 'Datapoint name is required',
                  })}
                />
              </Field>

              <Field label="URL" invalid={!!errors.url} error={errors.url && errors.url.message}>
                <Input
                  disabled={!editable}
                  placeholder="Datapoint URL"
                  name="url"
                  ref={register({
                    required: 'URL is required',
                  })}
                />
              </Field>

              <Field
                label="JSON XPath"
                invalid={!!errors.jsonxpath}
                error={errors.jsonxpath && errors.jsonxpath.message}
              >
                <Input
                  disabled={!editable}
                  placeholder="json xpath"
                  name="jsonxpath"
                  ref={register({
                    required: 'JSON XPath is required',
                  })}
                />
              </Field>

              <Field label="Point Unit" invalid={!!errors.unit} error={errors.unit && errors.unit.message}>
                <Input
                  disabled={!editable}
                  placeholder="unit"
                  name="unit"
                  ref={register({
                    required: 'Unit is required',
                  })}
                />
              </Field>

              <Field label="Format" invalid={!!errors.format} error={errors.format && errors.format.message}>
                <InputControl
                  as={RadioButtonGroup}
                  rules={{
                    required: 'Format selection is required',
                  }}
                  options={[
                    { label: 'json', value: OriginDocumentFormat.json },
                    { label: 'xml', value: OriginDocumentFormat.xml },
                  ]}
                  control={control}
                  defaultValue={OriginDocumentFormat.json}
                  name="radio"
                />
              </Field>
              <Button type="submit">{editable ? 'Update' : 'Save'}</Button>
            </FieldSet>
          </>
        );
      }}
    </Form>
  );
};
