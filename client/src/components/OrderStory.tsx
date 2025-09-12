import { useState } from 'react'
import { BookOpen, Sparkles } from 'lucide-react'

interface OrderStoryProps {
  story: string
  productName: string
  customization: {
    size: string
    color: string
    embroidery?: string
  }
}

export const OrderStory = ({ story, productName, customization }: OrderStoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Your Design's Story
            <Sparkles className="w-4 h-4 text-purple-500" />
          </h3>
          <p className="text-sm text-gray-600">The tale behind your {productName}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="w-4 h-4 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: customization.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            Size {customization.size}
          </span>
          {customization.embroidery && (
            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
              "{customization.embroidery}"
            </span>
          )}
        </div>

        <div className="relative">
          <p className={`text-gray-700 leading-relaxed italic ${
            !isExpanded ? 'line-clamp-3' : ''
          }`}>
            "{story}"
          </p>
          
          {story.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              {isExpanded ? 'Show less' : 'Read full story'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        ✨ Each story is uniquely crafted for your design ✨
      </div>
    </div>
  )
}