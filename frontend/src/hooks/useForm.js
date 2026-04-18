import { useState } from 'react'

/**
 * Generic hook quản lý form state.
 * @param {Object} initialValues
 */
export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)

  const setField = (key, value) =>
    setValues(prev => ({ ...prev, [key]: value }))

  const reset = (newValues = initialValues) =>
    setValues(newValues)

  const handleSubmit = async (onSubmit) => {
    setSaving(true)
    try {
      await onSubmit(values)
    } finally {
      setSaving(false)
    }
  }

  return { values, setField, reset, saving, setSaving, handleSubmit }
}
