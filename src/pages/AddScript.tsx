import React from 'react';
import { AlertErrorPayload, AlertPayload, AppEvents, AppRootProps } from '@grafana/data';
import { CodeEditor, Button, Input, HorizontalGroup, InputControl, Field, RadioButtonGroup, TextArea, FieldArray, CustomScrollbar, IconButton, FieldSet } from '@grafana/ui';
import { getAppEvents } from '@grafana/runtime';
import AutoSizer from 'react-virtualized-auto-sizer';
import { updateScript } from 'utils/api';
import { Script, ScriptLanguage, ScriptScope } from 'types';
import { useForm } from 'react-hook-form';
import { goToScripts } from 'utils/navigation';
import { ProjectSelector } from 'components/ProjectSelector';

const languageOptions = [
  { label: 'Javascript', value: ScriptLanguage.javascript },
  { label: 'Python', value: ScriptLanguage.pytnon },
  { label: 'Ruby', value: ScriptLanguage.ruby },
]

const scopeOptions = [
  { label: 'Organization', value: ScriptScope.organization },
  { label: 'Project', value: ScriptScope.project },
];

export const AddScript = ({ query }: AppRootProps) => {
  const appEvents = getAppEvents();

  const notifyError = (payload: AlertErrorPayload) =>
    appEvents.publish({ type: AppEvents.alertError.name, payload });

  const notifySuccess = (payload: AlertPayload) =>
    appEvents.publish({ type: AppEvents.alertSuccess.name, payload });

  const {
    formState: { errors },
    control,
    register,
    watch,
    handleSubmit,
  } = useForm<Script>({
    defaultValues: {
      params: undefined
    }, mode: 'onSubmit',
  });

  const onCancel = () => goToScripts()

  const saveScript = async (script: Script) => {
    try {
      await save(script)

      notifySuccess(['Saved'])
      goToScripts()
    } catch (e: any) {
      console.warn('Failed to save script:', e)
      notifyError(['Failed to save script', e])
    }
  }

  const onValid = (s: Script) => {
    saveScript(s)
  }

  const onInvalid = (v: any) => {
    console.warn('errors:', v)
    return
  }

  const language = watch('language');
  const scope = watch('scope');

  return (
    <div>
      <form onSubmit={handleSubmit(onValid, onInvalid)}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'stretch' }}>
          {/* left column */}
          <div style={{ minWidth: '250px', width: '250px', marginRight: '1rem' }}>
            <FieldSet>
              <Field
                label="Name"
                invalid={!!errors.name}
                error={errors.name && errors.name.message}
              >
                <Input
                  {...register('name', { required: 'Script name is required', })}
                  placeholder="Script name"
                />
              </Field>

              <Field
                label="Scope"
                invalid={!!errors.scope}
                error={errors.scope && errors.scope.message}
              >
                <InputControl
                  name="scope"
                  render={({ field: { onChange, ref, ...field } }) => (
                    <RadioButtonGroup
                      {...field}
                      onChange={(selectable) => onChange(selectable)}
                      options={scopeOptions}
                      fullWidth={true}
                    />
                  )}
                  control={control}
                  rules={{
                    required: 'Script scope is required',
                  }}
                />
              </Field>

              {/* Proejct Scope */}
              {scope === ScriptScope.project && <>
                <Field
                  label="project"
                  invalid={!!errors.project}
                  error={errors.project && errors.project.message}
                >

                  <InputControl
                    render={({ field }) => (
                      <FormProjectSelector onChange={field.onChange} />
                    )}
                    control={control}
                    rules={{
                      required: 'Project is required',
                    }}
                    name="project"
                  />

                </Field>
              </>}

              <Field
                label="Language"
                invalid={!!errors.language}
                error={errors.language && errors.language.message}
              >
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <RadioButtonGroup
                      {...field}
                      onChange={(selectable) => onChange(selectable)}
                      options={languageOptions}
                      fullWidth={true}
                    />
                  )}
                  control={control}
                  rules={{
                    required: 'Script language is required',
                  }}
                  name="language"
                />
              </Field>

              <Field
                label="Description"
                invalid={!!errors.description}
                error={errors.description && errors.description.message}
              >
                <TextArea
                  style={{ height: '5lh' }}

                  {...register('description')}
                  placeholder="Script description"
                />
              </Field>

              <HorizontalGroup style={{ alignItems: 'baseline' }}>
                <Button type="button" variant={'destructive'} onClick={onCancel}>{'Cancel'}</Button>
                <Button type="submit">{'Save'}</Button>
              </HorizontalGroup>
            </FieldSet>
          </div>

          {/* right column */}
          <div style={{ overflow: 'auto', height: '100%', minWidth: '250px', flex: 1 }}>
            <div>
              <Field
                label="Code"
                invalid={!!errors.code}
                error={errors.code && errors.code.message}
              >
                <AutoSizer style={{ width: '100%', height: '20lh' }}>
                  {({ height, width }: { height: number, width: number }) => (
                    <InputControl
                      render={({ field }) => (
                        <FormCodeEditor width={width} height={height}
                          code={field.value}
                          language={language}
                          onChange={field.onChange}
                        />
                      )}
                      control={control}
                      rules={{
                        required: 'Script code is required',
                      }}
                      name="code"
                    />
                  )}
                </AutoSizer>
              </Field>
              <Field label="Params">
                {/* @ts-ignore-check: react-hook-form made me do this */}
                <FieldArray control={control} name="params">
                  {({ fields, prepend, remove }) => (
                    <>
                      <Button
                        icon='plus'
                        tooltip={'Add param'}
                        onClick={() => { prepend({ name: '', description: '' }); }}
                      >Add param</Button>
                      <CustomScrollbar autoHeightMax='250px'>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {fields.map((field, index) => (
                            <div key={field.id} style={{ display: 'flex' }}>
                              <Field
                                invalid={!!errors.params?.[index]?.name}
                                error={errors.params?.[index]?.name?.message}
                              >
                                <Input
                                  {...register(`params.${index}.name`, { required: 'Field is required', })}
                                  placeholder="Name"
                                />
                              </Field>

                              <Input
                                {...register(`params.${index}.description`)}
                                placeholder="Description"
                              />

                              <IconButton
                                tooltip={'Remove param'}
                                name="trash-alt"
                                onClick={() => { remove(index); }}
                              />
                            </div>
                          ))}
                        </div>
                      </CustomScrollbar>
                    </>
                  )}
                </FieldArray>
              </Field>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const save = async (script: Script) => {
  if (script.name === '') {
    throw new Error("name cannot be empty")
  }

  await updateScript(script)
}

// Custom input form wrappers
// code editor
interface FormCodeEditorProps {
  width: number;
  height: number;
  code: string;
  language: string;
  onChange: (value: string) => void;
}

const FormCodeEditor: React.FC<FormCodeEditorProps> = ({ code, onChange, height, width, language }) => {
  return (
    <CodeEditor
      language={language}
      value={code}
      height={`${height}px`}
      width={`${width}px`}
      showLineNumbers

      onBlur={onChange}
      onSave={onChange}
    />
  );
};

// project slector
interface FormProjectSelectorProps {
  onChange: (value: string) => void;
}

const FormProjectSelector: React.FC<FormProjectSelectorProps> = ({ onChange }) => {
  return (
    <ProjectSelector
      onSelected={v => onChange(v.value!.name)}
    />
  );
};
