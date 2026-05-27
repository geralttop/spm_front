import { useState, useCallback } from 'react';
import { z } from 'zod';
import { getApiErrorMessage } from '@/shared/lib/api-error-message';
interface UseFormOptions<T> {
    initialValues: T;
    onSubmit: (values: T) => Promise<void>;
    validate?: (values: T) => Record<string, string>;
    schema?: z.ZodSchema<T>;
    submitErrorFallback?: string;
    mapSubmitError?: (error: unknown) => Record<string, string>;
}
export function useForm<T extends Record<string, any>>({ initialValues, onSubmit, validate, schema, submitErrorFallback = 'An error occurred', mapSubmitError, }: UseFormOptions<T>) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = useCallback((field: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }
    }, [errors]);
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (schema) {
            try {
                schema.parse(values);
            }
            catch (error) {
                if (error instanceof z.ZodError) {
                    const zodErrors: Record<string, string> = {};
                    error.issues.forEach((err) => {
                        const path = err.path.join('.');
                        zodErrors[path] = err.message;
                    });
                    setErrors(zodErrors);
                    return;
                }
            }
        }
        if (validate) {
            const validationErrors = validate(values);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }
        setIsSubmitting(true);
        setErrors({});
        try {
            await onSubmit(values);
        }
        catch (error: unknown) {
            if (mapSubmitError) {
                setErrors(mapSubmitError(error));
            }
            else {
                setErrors({ submit: getApiErrorMessage(error, submitErrorFallback) });
            }
        }
        finally {
            setIsSubmitting(false);
        }
    }, [values, validate, schema, onSubmit, submitErrorFallback, mapSubmitError]);
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
    }, [initialValues]);
    const setFieldValue = useCallback((field: keyof T, value: any) => {
        handleChange(field, value);
    }, [handleChange]);
    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        reset,
        setFieldValue,
        setValues,
    };
}
