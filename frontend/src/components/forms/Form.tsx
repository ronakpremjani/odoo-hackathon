import React from 'react';
import { useForm, UseFormReturn, SubmitHandler, FieldValues, UseFormProps } from 'react-hook-form';
import { ZodSchema } from 'zod';

interface FormProps<TFormValues extends FieldValues> {
  schema: ZodSchema<TFormValues>;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  formOptions?: UseFormProps<TFormValues>;
  className?: string;
}

export function Form<TFormValues extends FieldValues>({
  schema,
  onSubmit,
  children,
  formOptions,
  className,
}: FormProps<TFormValues>) {
  // Custom memoized zod resolver to prevent external library bloat
  const resolver = React.useMemo(() => {
    return (values: any) => {
      try {
        const parsed = schema.safeParse(values);
        if (parsed.success) {
          return { values: parsed.data, errors: {} };
        }

        const errors = parsed.error.issues.reduce((acc: any, issue) => {
          const path = issue.path.join('.');
          acc[path] = {
            type: issue.code,
            message: issue.message,
          };
          return acc;
        }, {});

        return { values: {}, errors };
      } catch (err: any) {
        return { values: {}, errors: { global: { message: err.message } } };
      }
    };
  }, [schema]);

  const methods = useForm<TFormValues>({
    ...formOptions,
    resolver,
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
      {children(methods)}
    </form>
  );
}
