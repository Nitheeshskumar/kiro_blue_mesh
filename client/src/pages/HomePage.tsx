import { Link } from 'react-router-dom'
import { Palette, Shirt, Zap } from 'lucide-react'
import { useHalloween } from '../contexts/HalloweenContext'
import { HalloweenText } from '../components/halloween/HalloweenText'
import { HalloweenButton } from '../components/halloween/HalloweenButton'

export const HomePage = () => {
  const { isHalloweenMode } = useHalloween();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-100 via-primary-50 to-secondary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZGE0YWYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <HalloweenText 
            as="h1" 
            variant={isHalloweenMode ? 'spooky' : 'normal'}
            className="text-4xl md:text-6xl font-light font-heading mb-6 text-gray-800"
          >
            {isHalloweenMode ? '🎃 Spooky Willowbrook 🎃' : 'Welcome to Willowbrook'}
          </HalloweenText>
          <HalloweenText 
            className={`text-xl md:text-2xl mb-4 font-light ${isHalloweenMode ? 'text-halloween-purple-700' : 'text-gray-700'}`}
          >
            {isHalloweenMode ? '👻 Spooktacular Mom & Baby Collections 👻' : 'Premium Mom & Baby Collections'}
          </HalloweenText>
          <HalloweenText 
            className={`text-lg mb-8 font-light max-w-2xl mx-auto ${isHalloweenMode ? 'text-halloween-black-700' : 'text-gray-600'}`}
          >
            {isHalloweenMode 
              ? 'Craft hauntingly beautiful, personalized clothing for you and your little ghoul with our spooky customization studio 🦇'
              : 'Craft beautiful, personalized clothing for you and your little one with our premium customization studio'
            }
          </HalloweenText>
          <HalloweenButton 
            variant={isHalloweenMode ? 'spooky' : 'primary'}
            className="inline-block font-light py-3 px-8 text-lg shadow-md hover:shadow-lg"
            onClick={() => window.location.href = '/products'}
          >
            {isHalloweenMode ? '🎃 Start Spooky Customizing 🎃' : 'Start Customizing'}
          </HalloweenButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HalloweenText 
              as="h2" 
              variant={isHalloweenMode ? 'spooky' : 'normal'}
              className="text-3xl font-light font-heading text-gray-900 mb-4"
            >
              {isHalloweenMode ? '🦇 Why Choose Spooky Willowbrook? 🦇' : 'Why Choose Willowbrook?'}
            </HalloweenText>
            <HalloweenText className={`text-lg font-light ${isHalloweenMode ? 'text-halloween-purple-700' : 'text-gray-600'}`}>
              {isHalloweenMode 
                ? 'Hauntingly designed for moms and their little monsters 👻'
                : 'Thoughtfully designed for moms and their little ones'
              }
            </HalloweenText>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center halloween-hover">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isHalloweenMode 
                  ? 'bg-gradient-to-br from-halloween-orange-500 to-halloween-purple-500 animate-pulse-glow' 
                  : 'bg-gradient-to-br from-primary-100 to-secondary-100'
              }`}>
                {isHalloweenMode ? (
                  <span className="text-2xl">🎨</span>
                ) : (
                  <Palette className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <HalloweenText 
                as="h3" 
                className="text-xl font-normal font-heading mb-2"
              >
                {isHalloweenMode ? '🎃 Spooky Customization 🎃' : 'Unlimited Customization'}
              </HalloweenText>
              <HalloweenText className={`font-light ${isHalloweenMode ? 'text-halloween-black-700' : 'text-gray-600'}`}>
                {isHalloweenMode
                  ? 'Personalize matching outfits for mom and baby with custom Halloween colors, spooky embroidery, and frightful designs 🦇'
                  : 'Personalize matching outfits for mom and baby with custom colors, embroidery, and designs'
                }
              </HalloweenText>
            </div>

            <div className="text-center halloween-hover">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isHalloweenMode 
                  ? 'bg-gradient-to-br from-halloween-purple-500 to-halloween-black-600 animate-pulse-glow' 
                  : 'bg-gradient-to-br from-secondary-100 to-primary-100'
              }`}>
                {isHalloweenMode ? (
                  <span className="text-2xl">👕</span>
                ) : (
                  <Shirt className="w-8 h-8 text-secondary-600" />
                )}
              </div>
              <HalloweenText 
                as="h3" 
                className="text-xl font-normal font-heading mb-2"
              >
                {isHalloweenMode ? '👻 Premium Spooky Quality 👻' : 'Premium Quality'}
              </HalloweenText>
              <HalloweenText className={`font-light ${isHalloweenMode ? 'text-halloween-black-700' : 'text-gray-600'}`}>
                {isHalloweenMode
                  ? 'Soft, baby-safe fabrics and professional manufacturing perfect for delicate skin - even for little monsters! 🎃'
                  : 'Soft, baby-safe fabrics and professional manufacturing perfect for delicate skin'
                }
              </HalloweenText>
            </div>

            <div className="text-center halloween-hover">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isHalloweenMode 
                  ? 'bg-gradient-to-br from-halloween-orange-500 to-halloween-black-600 animate-pulse-glow' 
                  : 'bg-gradient-to-br from-primary-100 to-secondary-100'
              }`}>
                {isHalloweenMode ? (
                  <span className="text-2xl">⚡</span>
                ) : (
                  <Zap className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <HalloweenText 
                as="h3" 
                className="text-xl font-normal font-heading mb-2"
              >
                {isHalloweenMode ? '⚡ Lightning Fast Delivery ⚡' : 'Fast Delivery'}
              </HalloweenText>
              <HalloweenText className={`font-light ${isHalloweenMode ? 'text-halloween-black-700' : 'text-gray-600'}`}>
                {isHalloweenMode
                  ? 'Quick turnaround so you can enjoy your spooky matching outfits before Halloween night! 🦇'
                  : 'Quick turnaround so you can enjoy your matching outfits sooner'
                }
              </HalloweenText>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5M2QyZmQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <HalloweenText 
            as="h2" 
            variant={isHalloweenMode ? 'spooky' : 'normal'}
            className="text-3xl font-light font-heading text-gray-900 mb-4"
          >
            {isHalloweenMode ? '🎃 Ready to Create Something Spooktacular? 🎃' : 'Ready to Create Something Special?'}
          </HalloweenText>
          <HalloweenText className={`text-lg mb-8 font-light ${isHalloweenMode ? 'text-halloween-purple-700' : 'text-gray-600'}`}>
            {isHalloweenMode
              ? 'Join thousands of moms who\'ve designed hauntingly beautiful matching outfits for their little monsters! 👻'
              : 'Join thousands of moms who\'ve designed beautiful matching outfits for their families'
            }
          </HalloweenText>
          <HalloweenButton 
            variant={isHalloweenMode ? 'primary' : 'primary'}
            className="inline-block font-light text-lg py-3 px-8 shadow-md hover:shadow-lg"
            onClick={() => window.location.href = '/products'}
          >
            {isHalloweenMode ? '🦇 Browse Spooky Collections 🦇' : 'Browse Collections'}
          </HalloweenButton>
        </div>
      </section>
    </div>
  )
}