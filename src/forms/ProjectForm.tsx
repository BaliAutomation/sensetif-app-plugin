import React, { FC } from 'react';
import { ProjectSettings } from '../types';
import { TimeZonePicker, Button, Field, FieldSet, Form, Input, InputControl, Select } from '@grafana/ui';
import { getNames as getCountryNames } from 'country-list';
import { SelectableValue } from '@grafana/data';

interface Props {
  editable?: boolean;
  project?: ProjectSettings;
  onSubmit: (data: ProjectSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const ProjectForm: FC<Props> = ({ editable, project, onSubmit }) => {
  return (
    <Form<ProjectSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: project?.name,
        title: project?.title,
        city: project?.city,
        geolocation: project?.geolocation,
      }}
    >
      {({ register, errors, control }) => {
        return (
          <>
            <FieldSet label="Project details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  disabled={!editable}
                  placeholder="Project name"
                  name="name"
                  ref={register({
                    required: 'Project name is required',
                    pattern: { value: /[a-z][A-Za-z0-9_]*/, message: 'Allowed letters, numbers and characters: _, * ' },
                  })}
                />
              </Field>

              <Field label="Title" invalid={!!errors.title} error={errors.title && errors.title.message}>
                <Input
                  disabled={!editable}
                  placeholder="Project title"
                  name="title"
                  ref={register({
                    required: 'Project title is required',
                  })}
                />
              </Field>

              <Field label="Country" invalid={!!errors.country} error={errors.country && errors.country.message}>
                <InputControl
                  as={Select}
                  rules={{
                    required: 'Country selection is required',
                  }}
                  options={getCountryNames().map((c) => ({ label: c, value: c }))}
                  onChange={(elements: SelectableValue[]) => elements[0].value}
                  control={control}
                  name="country"
                />
              </Field>

              <Field label="City" invalid={!!errors.city} error={errors.city && errors.city.message}>
                <Input
                  disabled={!editable}
                  placeholder="City"
                  name="city"
                  ref={register({
                    required: 'City is required',
                  })}
                />
              </Field>

              <Field label="Time zone" invalid={!!errors.timezone} error={errors.timezone && errors.timezone.message}>
                <InputControl
                  as={TimeZonePicker}
                  rules={{
                    required: 'Timezone selection is required',
                  }}
                  control={control}
                  name="timezone"
                />
              </Field>

              <Field
                label="Geolocation"
                invalid={!!errors.geolocation}
                error={errors.geolocation && errors.geolocation.message}
              >
                <Input
                  disabled={!editable}
                  placeholder="latitude,longitude"
                  name="geolocation"
                  ref={register({
                    required: 'Geolocation is required',
                  })}
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
