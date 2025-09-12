import { Link } from 'react-router-dom'
import { Palette, Shirt, Zap } from 'lucide-react'

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Willowbrook
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Craft your perfect clothing with our premium customization studio
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Customizing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Willowbrook?
            </h2>
            <p className="text-lg text-gray-600">
              Professional quality meets personal style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Customization</h3>
              <p className="text-gray-600">
                Choose from hundreds of colors, add custom embroidery, upload logos, and personalize every detail
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shirt className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                High-quality fabrics and professional manufacturing ensure your custom clothing lasts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Automated production pipeline ensures quick turnaround times without compromising quality
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who've designed their perfect clothing
          </p>
          <Link
            to="/products"
            className="btn-primary text-lg py-3 px-8"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  )
}