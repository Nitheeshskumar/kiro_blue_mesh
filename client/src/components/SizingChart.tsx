import React, { useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';
import { INDIAN_SIZE_CHART, SIZE_GUIDE_TIPS, SizeChart } from '../data/sizingChart';

interface SizingChartProps {
  isOpen: boolean;
  onClose: () => void;
  availableSizes?: string[]; // Sizes that the product offers
  selectedSizes?: string[];  // Sizes that the user has actually selected
}

export const SizingChart: React.FC<SizingChartProps> = ({ 
  isOpen, 
  onClose, 
  availableSizes = [],
  selectedSizes = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'baby' | 'kids' | 'adult'>('adult');

  if (!isOpen) return null;

  const filterSizesByCategory = (category: 'baby' | 'kids' | 'adult'): SizeChart[] => {
    switch (category) {
      case 'baby':
        return INDIAN_SIZE_CHART.filter(size => size.size.includes('months'));
      case 'kids':
        return INDIAN_SIZE_CHART.filter(size => 
          !size.size.includes('months') && 
          !['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].includes(size.size)
        );
      case 'adult':
        return INDIAN_SIZE_CHART.filter(size => 
          ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].includes(size.size)
        );
      default:
        return [];
    }
  };

  const currentSizes = filterSizesByCategory(activeTab);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Ruler className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Indian Size Chart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            {[
              { key: 'baby', label: 'Baby (0-24 months)' },
              { key: 'kids', label: 'Kids (3-16 years)' },
              { key: 'adult', label: 'Adult' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Size Chart Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Size
                    </th>
                    {activeTab === 'baby' || activeTab === 'kids' ? (
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                        Age
                      </th>
                    ) : null}
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Chest (cm)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Waist (cm)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Hip (cm)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Length (cm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentSizes.map((size, index) => {
                    const isAvailable = Array.isArray(availableSizes) && availableSizes.includes(size.size);
                    const isSelected = Array.isArray(selectedSizes) && selectedSizes.includes(size.size);
                    return (
                      <tr 
                        key={size.size}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } ${isSelected ? 'bg-primary-50 border-primary-200' : isAvailable ? 'bg-green-50 border-green-200' : ''}`}
                      >
                        <td className={`border border-gray-300 px-4 py-3 font-medium ${
                          isSelected ? 'text-primary-700' : isAvailable ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {size.size}
                          {isSelected && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                          {isAvailable && !isSelected && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Available
                            </span>
                          )}
                        </td>
                        {size.age && (
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">
                            {size.age}
                          </td>
                        )}
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {size.chest}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {size.waist}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {size.hip}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {size.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Size Guide Tips */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Measurement Guide</h3>
              </div>
              <ul className="space-y-2">
                {SIZE_GUIDE_TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-blue-800">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};