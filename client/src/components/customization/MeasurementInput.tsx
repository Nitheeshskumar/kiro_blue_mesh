import React, { useState, useEffect } from 'react'
import { MeasurementFields, MeasurementValidation } from '../../types/customization.types'
import PremiumCard from '../ui/PremiumCard'
import PremiumButton from '../ui/PremiumButton'
import PremiumInput from '../ui/PremiumInput'

interface MeasurementInputProps {
  measurements?: MeasurementFields
  onMeasurementsChange: (measurements: MeasurementFields) => void
  onSave?: (measurements: MeasurementFields) => void
  onCancel?: () => void
  productType?: 'shirt' | 'pants' | 'dress' | 'general'
  unit?: 'inches' | 'cm'
  className?: string
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  measurements = {},
  onMeasurementsChange,
  onSave,
  onCancel,
  productType = 'general',
  unit = 'inches',
  className = ''
}) => {
  const [localMeasurements, setLocalMeasurements] = useState<MeasurementFields>(measurements)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showGuide, setShowGuide] = useState(false)

  // Validation rules based on unit
  const validationRules: { [key in keyof MeasurementFields]: MeasurementValidation } = {
    chest: { field: 'chest', min: unit === 'inches' ? 28 : 71, max: unit === 'inches' ? 60 : 152, unit },
    waist: { field: 'waist', min: unit === 'inches' ? 24 : 61, max: unit === 'inches' ? 50 : 127, unit },
    hips: { field: 'hips', min: unit === 'inches' ? 30 : 76, max: unit === 'inches' ? 55 : 140, unit },
    shoulderWidth: { field: 'shoulderWidth', min: unit === 'inches' ? 14 : 36, max: unit === 'inches' ? 24 : 61, unit },
    armLength: { field: 'armLength', min: unit === 'inches' ? 20 : 51, max: unit === 'inches' ? 36 : 91, unit },
    length: { field: 'length', min: unit === 'inches' ? 20 : 51, max: unit === 'inches' ? 40 : 102, unit },
    inseam: { field: 'inseam', min: unit === 'inches' ? 26 : 66, max: unit === 'inches' ? 38 : 97, unit },
    neckCircumference: { field: 'neckCircumference', min: unit === 'inches' ? 12 : 30, max: unit === 'inches' ? 20 : 51, unit },
    bicep: { field: 'bicep', min: unit === 'inches' ? 10 : 25, max: unit === 'inches' ? 20 : 51, unit },
    wrist: { field: 'wrist', min: unit === 'inches' ? 5 : 13, max: unit === 'inches' ? 9 : 23, unit }
  }

  // Get relevant fields based on product type
  const getRelevantFields = (): (keyof MeasurementFields)[] => {
    switch (productType) {
      case 'shirt':
        return ['chest', 'waist', 'shoulderWidth', 'armLength', 'length', 'neckCircumference', 'bicep']
      case 'pants':
        return ['waist', 'hips', 'inseam', 'length']
      case 'dress':
        return ['chest', 'waist', 'hips', 'shoulderWidth', 'armLength', 'length']
      default:
        return ['chest', 'waist', 'hips', 'shoulderWidth', 'armLength', 'length']
    }
  }

  const relevantFields = getRelevantFields()

  const validateMeasurement = (field: keyof MeasurementFields, value: number): string | null => {
    const rule = validationRules[field]
    if (!rule) return null

    if (value < rule.min) {
      return `Minimum ${rule.min} ${rule.unit}`
    }
    if (value > rule.max) {
      return `Maximum ${rule.max} ${rule.unit}`
    }
    return null
  }

  const handleMeasurementChange = (field: keyof MeasurementFields, value: string) => {
    const numValue = parseFloat(value)
    const newMeasurements = { ...localMeasurements, [field]: isNaN(numValue) ? undefined : numValue }
    
    setLocalMeasurements(newMeasurements)
    
    // Validate
    const newErrors = { ...errors }
    if (!isNaN(numValue)) {
      const error = validateMeasurement(field, numValue)
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
    } else {
      delete newErrors[field]
    }
    setErrors(newErrors)
    
    onMeasurementsChange(newMeasurements)
  }

  const isValid = () => {
    return Object.keys(errors).length === 0 && 
           relevantFields.some(field => localMeasurements[field] !== undefined)
  }

  const getFieldLabel = (field: keyof MeasurementFields): string => {
    const labels: { [key in keyof MeasurementFields]: string } = {
      chest: 'Chest/Bust',
      waist: 'Waist',
      hips: 'Hips',
      shoulderWidth: 'Shoulder Width',
      armLength: 'Arm Length',
      length: productType === 'pants' ? 'Leg Length' : 'Garment Length',
      inseam: 'Inseam',
      neckCircumference: 'Neck',
      bicep: 'Bicep',
      wrist: 'Wrist'
    }
    return labels[field]
  }

  const getFieldDescription = (field: keyof MeasurementFields): string => {
    const descriptions: { [key in keyof MeasurementFields]: string } = {
      chest: 'Measure around the fullest part of your chest/bust',
      waist: 'Measure around your natural waistline',
      hips: 'Measure around the fullest part of your hips',
      shoulderWidth: 'Measure from shoulder point to shoulder point',
      armLength: 'Measure from shoulder to wrist',
      length: productType === 'pants' ? 'Measure from waist to desired hem' : 'Desired garment length',
      inseam: 'Measure from crotch to desired hem',
      neckCircumference: 'Measure around the base of your neck',
      bicep: 'Measure around the fullest part of your upper arm',
      wrist: 'Measure around your wrist'
    }
    return descriptions[field]
  }

  return (
    <div className={className}>
      <PremiumCard elevation="medium" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Custom Measurements</h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Unit: {unit}</span>
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => setShowGuide(!showGuide)}
            >
              {showGuide ? 'Hide' : 'Show'} Guide
            </PremiumButton>
          </div>
        </div>

        {showGuide && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Measurement Guide</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a flexible measuring tape</li>
              <li>• Measure over close-fitting clothing or undergarments</li>
              <li>• Keep the tape parallel to the floor</li>
              <li>• Don't pull the tape too tight - it should be snug but comfortable</li>
              <li>• Have someone help you for more accurate measurements</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantFields.map((field) => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {getFieldLabel(field)}
                <span className="text-gray-500 ml-1">({unit})</span>
              </label>
              
              <PremiumInput
                type="number"
                step="0.25"
                min={validationRules[field]?.min}
                max={validationRules[field]?.max}
                value={localMeasurements[field] || ''}
                onChange={(e) => handleMeasurementChange(field, e.target.value)}
                placeholder={`Enter ${getFieldLabel(field).toLowerCase()}`}
                error={errors[field]}
              />
              
              <p className="text-xs text-gray-500">{getFieldDescription(field)}</p>
            </div>
          ))}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-1">Please correct the following:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {getFieldLabel(field as keyof MeasurementFields)}: {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <PremiumButton variant="outline" onClick={onCancel}>
              Cancel
            </PremiumButton>
          )}
          {onSave && (
            <PremiumButton
              variant="primary"
              onClick={() => onSave(localMeasurements)}
              disabled={!isValid()}
            >
              Save Measurements
            </PremiumButton>
          )}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Custom measurements ensure the best fit but may require additional processing time. 
            All measurements are stored securely and can be reused for future orders.
          </p>
        </div>
      </PremiumCard>
    </div>
  )
}