import React from 'react'
import PremiumCard from '../ui/PremiumCard'
import PremiumButton from '../ui/PremiumButton'

interface MeasurementGuideModalProps {
  isOpen: boolean
  onClose: () => void
  productType?: 'shirt' | 'pants' | 'dress' | 'general'
  unit?: 'inches' | 'cm'
}

export const MeasurementGuideModal: React.FC<MeasurementGuideModalProps> = ({
  isOpen,
  onClose,
  productType = 'general',
  unit = 'inches'
}) => {
  if (!isOpen) return null

  const getMeasurementInstructions = () => {
    const baseInstructions = [
      {
        name: 'Chest/Bust',
        instruction: 'Measure around the fullest part of your chest/bust, keeping the tape parallel to the floor.',
        image: '👔',
        tips: ['Wear a well-fitting bra if applicable', 'Don\'t hold your breath', 'Keep arms relaxed at sides']
      },
      {
        name: 'Waist',
        instruction: 'Measure around your natural waistline, which is typically the narrowest part of your torso.',
        image: '📏',
        tips: ['Find your natural waist by bending to one side', 'Don\'t suck in your stomach', 'Keep tape snug but not tight']
      },
      {
        name: 'Hips',
        instruction: 'Measure around the fullest part of your hips and buttocks.',
        image: '📐',
        tips: ['Stand with feet together', 'Measure over your undergarments', 'Keep tape parallel to floor']
      }
    ]

    if (productType === 'shirt' || productType === 'dress') {
      baseInstructions.push(
        {
          name: 'Shoulder Width',
          instruction: 'Measure from the edge of one shoulder to the edge of the other shoulder across your back.',
          image: '📏',
          tips: ['Have someone help with this measurement', 'Measure across the back', 'Keep shoulders relaxed']
        },
        {
          name: 'Arm Length',
          instruction: 'Measure from the shoulder point down to your wrist.',
          image: '📏',
          tips: ['Keep arm slightly bent', 'Measure over the outside of your arm', 'End at wrist bone']
        }
      )
    }

    if (productType === 'pants') {
      baseInstructions.push({
        name: 'Inseam',
        instruction: 'Measure from the crotch seam down to where you want the hem to fall.',
        image: '📏',
        tips: ['Use pants that fit well as reference', 'Measure along the inside of your leg', 'Consider shoe height']
      })
    }

    return baseInstructions
  }

  const instructions = getMeasurementInstructions()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <PremiumCard elevation="high" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Measurement Guide</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* General Tips */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">General Tips for Accurate Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Use a flexible measuring tape (cloth or plastic)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Measure over close-fitting clothing or undergarments</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Keep the tape parallel to the floor</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Don't pull the tape too tight - it should be snug but comfortable</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Have someone help you for more accurate measurements</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">✓</span>
                  <span>Take measurements at the same time of day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Measurement Instructions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Instructions</h3>
            
            {instructions.map((instruction, index) => (
              <div key={instruction.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center text-2xl">
                      {instruction.image}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {index + 1}. {instruction.name}
                      <span className="text-sm text-gray-500 ml-2">({unit})</span>
                    </h4>
                    
                    <p className="text-gray-700 mb-3">{instruction.instruction}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">Pro Tips:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {instruction.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start space-x-2">
                            <span className="text-forest-600 mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Size Chart Reference */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Standard Size Reference</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Chest ({unit})</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Waist ({unit})</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Hips ({unit})</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {unit === 'inches' ? (
                    <>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XS</td>
                        <td className="py-2 px-3">32-34</td>
                        <td className="py-2 px-3">24-26</td>
                        <td className="py-2 px-3">34-36</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">S</td>
                        <td className="py-2 px-3">34-36</td>
                        <td className="py-2 px-3">26-28</td>
                        <td className="py-2 px-3">36-38</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">M</td>
                        <td className="py-2 px-3">36-38</td>
                        <td className="py-2 px-3">28-30</td>
                        <td className="py-2 px-3">38-40</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">L</td>
                        <td className="py-2 px-3">38-40</td>
                        <td className="py-2 px-3">30-32</td>
                        <td className="py-2 px-3">40-42</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XL</td>
                        <td className="py-2 px-3">40-42</td>
                        <td className="py-2 px-3">32-34</td>
                        <td className="py-2 px-3">42-44</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XS</td>
                        <td className="py-2 px-3">81-86</td>
                        <td className="py-2 px-3">61-66</td>
                        <td className="py-2 px-3">86-91</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">S</td>
                        <td className="py-2 px-3">86-91</td>
                        <td className="py-2 px-3">66-71</td>
                        <td className="py-2 px-3">91-97</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">M</td>
                        <td className="py-2 px-3">91-97</td>
                        <td className="py-2 px-3">71-76</td>
                        <td className="py-2 px-3">97-102</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">L</td>
                        <td className="py-2 px-3">97-102</td>
                        <td className="py-2 px-3">76-81</td>
                        <td className="py-2 px-3">102-107</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-3 font-medium">XL</td>
                        <td className="py-2 px-3">102-107</td>
                        <td className="py-2 px-3">81-86</td>
                        <td className="py-2 px-3">107-112</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end">
            <PremiumButton variant="primary" onClick={onClose}>
              Got It, Start Measuring
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}