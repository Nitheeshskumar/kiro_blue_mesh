import { Link } from 'react-router-dom'
import { Palette, Shirt, Zap } from 'lucide-react'

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-100 via-primary-50 to-secondary-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZGE0YWYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-light font-heading mb-6 text-gray-800">
            Welcome to Willowbrook
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-700 font-light">
            Premium Mom & Baby Collections
          </p>
          <p className="text-lg mb-8 text-gray-600 font-light max-w-2xl mx-auto">
            Craft beautiful, personalized clothing for you and your little one with our premium customization studio
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-500 text-white font-light py-3 px-8 rounded-lg hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
          >
            Start Customizing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light font-heading text-gray-900 mb-4">
              Why Choose Willowbrook?
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Thoughtfully designed for moms and their little ones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-normal font-heading mb-2">Unlimited Customization</h3>
              <p className="text-gray-600 font-light">
                Personalize matching outfits for mom and baby with custom colors, embroidery, and designs
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-secondary-100 to-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-normal font-heading mb-2">Premium Quality</h3>
              <p className="text-gray-600 font-light">
                Soft, baby-safe fabrics and professional manufacturing perfect for delicate skin
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-normal font-heading mb-2">Fast Delivery</h3>
              <p className="text-gray-600 font-light">
                Quick turnaround so you can enjoy your matching outfits sooner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5M2QyZmQiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-light font-heading text-gray-900 mb-4">
            Ready to Create Something Special?
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-light">
            Join thousands of moms who've designed beautiful matching outfits for their families
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-light text-lg py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Browse Collections
          </Link>
        </div>
      </section>
    </div>
  )
}