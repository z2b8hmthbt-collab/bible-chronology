"use client";

import {
  createContext,
  useContext,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

interface FormFieldContextValue {
  fieldId: string;
  errorId?: string;
  hasError: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormFieldProps(): {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
} {
  const ctx = useContext(FormFieldContext);
  if (!ctx) return { id: "" };
  return {
    id: ctx.fieldId,
    ...(ctx.hasError
      ? { "aria-describedby": ctx.errorId, "aria-invalid": true as const }
      : {}),
  };
}

/** id for `aria-labelledby` on composite controls (e.g. DateInput). */
export function useFormFieldLabelId(): string | undefined {
  const ctx = useContext(FormFieldContext);
  return ctx ? `${ctx.fieldId}-label` : undefined;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  const fieldId = useId();
  const errorId = error ? `${fieldId}-error` : undefined;
  const labelId = `${fieldId}-label`;

  return (
    <FormFieldContext.Provider
      value={{ fieldId, errorId, hasError: Boolean(error) }}
    >
      <div className="space-y-1.5">
        <label id={labelId} htmlFor={fieldId} className="block text-sm font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {children}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export const textareaClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-y";

export const selectClass = inputClass;

export const buttonPrimaryClass =
  "w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-50";

export const buttonSecondaryClass =
  "rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--background)]";

export function FormInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const fieldProps = useFormFieldProps();
  return (
    <input
      className={className ? `${inputClass} ${className}` : inputClass}
      {...fieldProps}
      {...props}
    />
  );
}

export function FormTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fieldProps = useFormFieldProps();
  return (
    <textarea
      className={className ? `${textareaClass} ${className}` : textareaClass}
      {...fieldProps}
      {...props}
    />
  );
}

export function FormSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const fieldProps = useFormFieldProps();
  return (
    <select
      className={className ? `${selectClass} ${className}` : selectClass}
      {...fieldProps}
      {...props}
    />
  );
}
