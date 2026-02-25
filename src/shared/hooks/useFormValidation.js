/**
 * useFormValidation - Form state and validation hook (F36)
 *
 * Usage:
 *   const { values, errors, handleChange, validate, reset } = useFormValidation(initialValues, rules);
 *
 * Rules shape: { fieldName: (value, allValues) => errorString | null }
 */
import { useState, useCallback, useRef, useEffect } from "react";

export default function useFormValidation(initialValues = {}, rules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const rulesRef = useRef(rules);
  useEffect(() => { rulesRef.current = rules; });

  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    const nextValue = type === "checkbox" ? checked : type === "file" ? files : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Clear error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const r = rulesRef.current;
    const nextErrors = {};
    let isValid = true;

    for (const key of Object.keys(r)) {
      const error = r[key](values[key], values);
      if (error) {
        nextErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(nextErrors);
    setTouched(
      Object.keys(r).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    return isValid;
  }, [values]);

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, setValue, validate, reset, setValues, setErrors };
}
