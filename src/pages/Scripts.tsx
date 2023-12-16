import React, { useState, useEffect } from 'react';
import { AlertErrorPayload, AlertPayload, AppEvents, AppRootProps } from '@grafana/data';
import { CodeEditor, Button, Select, Input, FieldArray, HorizontalGroup, InputControl, Field, FieldSet } from '@grafana/ui';
import { getAppEvents } from '@grafana/runtime';
import { updateScript, listScripts } from 'utils/api';
import { Script } from 'types';
import { useForm } from 'react-hook-form';
import { ScriptSelector } from 'components/ScriptSelector';

const supportedLanguages = ['javascript', 'python', 'ruby']

export const Scripts = ({ query }: AppRootProps) => {
  const [scripts, setScripts] = useState()

  useEffect(() => {
    loadScripts()
  }, []);

  const appEvents = getAppEvents();

  const notifyError = (payload: AlertErrorPayload) =>
    appEvents.publish({ type: AppEvents.alertError.name, payload });

  const notifySuccess = (payload: AlertPayload) =>
    appEvents.publish({ type: AppEvents.alertSuccess.name, payload });

  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
  } = useForm<Script>({
    defaultValues: {
      params: []
    }, mode: 'onSubmit',
  });

  const onSave = async (script: Script) => {
    try {
      await save(script)

      notifySuccess(['Saved'])
      loadScripts()
    } catch (e: any) {
      console.log('Failed to save script:', e)
      notifyError(['Failed to save script', e])
    }
  }

  const loadScripts = async () => {
    const scripts = await listScripts()
    setScripts(scripts)
  }

  const onValid = (s: Script) => {
    console.log('valid script: ', s)
    onSave(s)
  }

  const onInvalid = (v: any) => {
    console.log('errors:', v)
    return
  }

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          <FieldSet label="Script">
            <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
              <Input
                {...register('name', { required: 'Script name is required', })}
                placeholder="Script name"
              />
            </Field>

            <Field label="Description" invalid={!!errors.description} error={errors.description && errors.description.message}>
              <Input
                {...register('description')}
                placeholder="Script description"
              />
            </Field>

            <Field
              label="Language"
              invalid={!!errors.language}
              error={errors.language && errors.language.message}
            >
              <InputControl
                render={({ field: { onChange, ref, ...field } }) => (
                  <Select
                    {...field}
                    onChange={(selectable) => onChange(selectable.value)}
                    options={supportedLanguages.map(sl => ({ label: sl, value: sl }))}
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
              label="Code"
              invalid={!!errors.code}
              error={errors.code && errors.code.message}
            >
              <InputControl
                render={({ field }) => (
                  <CustomInput value={field.value} onChange={field.onChange} />
                )}
                control={control}
                rules={{
                  required: 'Script code is required',
                }}
                name="code"
              />
            </Field>

            {/* @ts-ignore-check: react-hook-form made me do this */}
            <FieldArray control={control} name="params">
              {({ fields, append }) => (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    {fields.map((field, index) => (
                      <HorizontalGroup key={field.id}>
                        <Field
                          invalid={!!errors.params?.[index]?.key}
                          error={errors.params?.[index]?.key?.message}
                        >
                          <Input
                            {...register(`params.${index}.key`, { required: 'Field is required', })}
                            placeholder="key"
                          />
                        </Field>

                        <Field
                          invalid={!!errors.params?.[index]?.value}
                          error={errors.params?.[index]?.value?.message}
                        >
                          <Input
                            {...register(`params.${index}.value`, { required: 'Field is required', })}
                            placeholder="value"
                          />
                        </Field>
                      </HorizontalGroup>
                    ))}
                  </div>
                  <Button onClick={() => append({ key: '', value: '' })}>Add param</Button>
                </>
              )}
            </FieldArray>
          </FieldSet>

          <Button type="submit">Submit</Button>
        </form>

      </div >
      <div>
        <h1>Organization Scripts:</h1>
        <pre>
          {JSON.stringify(scripts, null, '  ')}
        </pre>
      </div>

      <div>
        <h1>Selector::</h1>
        <ScriptSelector onSelected={(s) => { console.log(s) }} />
      </div>
    </>
  );
};

const save = async (script: Script) => {
  if (script.name === '') {
    throw new Error("name cannot be empty")
  }


  const resp = await updateScript(script)
  console.log('saved: ')
  console.log(resp)
}

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({ value, onChange }) => {
  return (
    <CodeEditor
      language={'javascript'}
      value={value}
      height={'250px'}
      showLineNumbers

      onBlur={onChange}
      onSave={onChange}
    />
  );
};

export default CustomInput;
