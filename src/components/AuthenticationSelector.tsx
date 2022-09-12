import { useForm, UseFormReturn } from 'react-hook-form';
import {
  Authentication,
  AuthenticationType,
  NoAuthentication,
  TokenBearerAuthentication,
  UserPassAuthentication,
} from '../types';
import React, { FC } from 'react';
import { Field, HorizontalGroup, Input, InputControl, RadioButtonGroup } from '@grafana/ui';

interface Props extends UseFormReturn<Authentication> {
  auth: Authentication;
}

export const AuthenticationSelector: FC<Props> = ({ auth, control, watch, register, formState: { errors } }) => {
  const authType = watch('authenticationType');
  let authApi = useForm<Authentication>({
    defaultValues: {
      authenticationType: AuthenticationType.none,
    },
  });
  return (
    <>
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
      {authType === AuthenticationType.none && (
        <NoInput auth={auth as NoAuthentication} {...(authApi as any as UseFormReturn<NoAuthentication>)} />
      )}

      {authType === AuthenticationType.basic && (
        <UserPassInput
          auth={auth as UserPassAuthentication}
          {...(authApi as any as UseFormReturn<UserPassAuthentication>)}
        />
      )}
      {authType === AuthenticationType.bearerToken && (
        <BearerInput
          auth={auth as TokenBearerAuthentication}
          {...(authApi as any as UseFormReturn<TokenBearerAuthentication>)}
        />
      )}
    </>
  );
};

interface UserPassProps extends UseFormReturn<UserPassAuthentication> {
  auth: UserPassAuthentication;
}

const UserPassInput: FC<UserPassProps> = ({ register, formState: { errors } }) => {
  return (
    <HorizontalGroup>
      <Field label="Username" invalid={!!errors?.username} error={errors?.username && errors?.username.message}>
        <Input
          {...register('username', {
            required: 'Username is required',
          })}
          placeholder="Username"
        />
      </Field>
      <Field label="Password" invalid={!!errors?.password} error={errors?.password && errors?.password.message}>
        <Input
          {...register('password', {
            required: 'Password is required',
          })}
          placeholder="Password"
        />
      </Field>
    </HorizontalGroup>
  );
};

interface BearerInputProps extends UseFormReturn<TokenBearerAuthentication> {
  auth: TokenBearerAuthentication;
}

const BearerInput: FC<BearerInputProps> = ({ watch, register, formState: { errors } }) => {
  return (
    <Field label="Bearer Token" invalid={!!errors?.token} error={errors?.token && errors?.token.message}>
      <Input
        {...register('token', {
          required: 'Token is required',
        })}
        placeholder="Bearer Token"
      />
    </Field>
  );
};

interface NoInputProps extends UseFormReturn<NoAuthentication> {
  auth: NoAuthentication;
}

const NoInput: FC<NoInputProps> = ({ watch, register, formState: { errors } }) => {
  return <></>;
};
