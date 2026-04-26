import { Link } from "react-router-dom";
import { Shirt, ChevronLeft, ChevronRight } from "lucide-react";
import { useHalloween } from "../contexts/HalloweenContext";
import { HalloweenText } from "../components/halloween/HalloweenText";
import { HalloweenButton } from "../components/halloween/HalloweenButton";
import { useState, useEffect } from "react";
import { productApi } from "../lib/api";
import type { Product } from "../types";
import { getProxiedImageUrl } from '../lib/imageUtils';
import { SEO } from '../components/SEO';

export const HomePage = () => {
  const { isHalloweenMode } = useHalloween();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productApi.getProducts();
        // Get first 8 products as featured
        setFeaturedProducts(response.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 4 >= featuredProducts.length ? 0 : prev + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - 4 < 0 ? Math.max(0, featuredProducts.length - 4) : prev - 4
    );
  };

  const visibleProducts = featuredProducts.slice(currentIndex, currentIndex + 4);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Willowbrook Clothing - Premium Mom & Baby Collections" 
        description="Craft beautiful personalized clothing for you and your little one." 
      />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/images/hero-background.jpg)",
          }}
        ></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        {/* Pattern overlay (optional, for texture) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZGE0YWYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <HalloweenText
            as="h1"
            variant={isHalloweenMode ? "spooky" : "normal"}
            className="text-4xl md:text-6xl font-light font-heading mb-6 text-white drop-shadow-lg"
          >
            {isHalloweenMode
              ? "🎃 Spooky Willowbrook 🎃"
              : "Welcome to Willowbrook"}
          </HalloweenText>
          <HalloweenText
            className={`text-xl md:text-2xl mb-4 font-light drop-shadow-md ${
              isHalloweenMode ? "text-halloween-orange-200" : "text-white"
            }`}
          >
            {isHalloweenMode
              ? "👻 Spooktacular Mom & Baby Collections 👻"
              : "Premium Mom & Baby Collections"}
          </HalloweenText>
          <HalloweenText
            className={`text-lg mb-8 font-light max-w-2xl mx-auto drop-shadow-md ${
              isHalloweenMode ? "text-halloween-orange-100" : "text-gray-100"
            }`}
          >
            {isHalloweenMode
              ? "Craft hauntingly beautiful, personalized clothing for you and your little ghoul with our spooky customization studio 🦇"
              : "Craft your beautiful personalized clothing ideas with us..."}
          </HalloweenText>
          <HalloweenButton
            variant={isHalloweenMode ? "spooky" : "primary"}
            className="inline-block font-light py-4 px-10 text-lg shadow-2xl hover:shadow-3xl bg-white text-gray-900 hover:bg-gray-100 border-2 border-white hover:border-gray-200 font-semibold transform hover:scale-105 transition-all duration-300"
            onClick={() => (window.location.href = "/products")}
          >
            {isHalloweenMode
              ? "🎃 Start Spooky Customizing 🎃"
              : "Browse Products"}
          </HalloweenButton>
        </div>
      </section>


      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HalloweenText
              as="h2"
              variant={isHalloweenMode ? "spooky" : "normal"}
              className="text-3xl md:text-4xl font-light font-heading mb-4"
            >
              {isHalloweenMode
                ? "🎃 Featured Spooky Collections 🎃"
                : "Featured Products"}
            </HalloweenText>
            <HalloweenText
              className={`text-lg max-w-2xl mx-auto ${
                isHalloweenMode ? "text-halloween-orange-600" : "text-gray-600"
              }`}
            >
              {isHalloweenMode
                ? "Discover our most popular spooktacular designs, handpicked for your haunting style! 👻"
                : "Discover our most popular designs, handpicked just for you"}
            </HalloweenText>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Navigation */}
              {featuredProducts.length > 4 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-pink-300"
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className={`w-6 h-6 ${currentIndex === 0 ? 'text-gray-400' : 'text-pink-600'}`} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-pink-300"
                    disabled={currentIndex + 4 >= featuredProducts.length}
                  >
                    <ChevronRight className={`w-6 h-6 ${currentIndex + 4 >= featuredProducts.length ? 'text-gray-400' : 'text-pink-600'}`} />
                  </button>
                </>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8">
                {visibleProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group flex flex-col items-center text-center hover:transform hover:scale-105 transition-all duration-300"
                  >
                    {/* Round Product Image */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 border-4 border-white group-hover:border-pink-200">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={getProxiedImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                          <Shirt className="w-8 h-8 md:w-12 md:h-12 text-pink-600" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {isHalloweenMode ? "👻 View" : "View"}
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <HalloweenText
                      variant={isHalloweenMode ? "spooky" : "normal"}
                      className="font-medium text-sm md:text-base mb-2 group-hover:text-pink-600 transition-colors duration-300"
                    >
                      {product.name}
                    </HalloweenText>
                    <p className={`text-lg font-semibold ${
                      isHalloweenMode ? "text-halloween-orange-600" : "text-pink-600"
                    }`}>
                      ₹{product.basePrice.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Dots Indicator */}
              {featuredProducts.length > 4 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: Math.ceil(featuredProducts.length / 4) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index * 4)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex / 4) === index
                          ? isHalloweenMode ? 'bg-halloween-orange-500' : 'bg-pink-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View All Products Button */}
          <div className="text-center mt-12">
            <HalloweenButton
              variant={isHalloweenMode ? "spooky" : "primary"}
              className="inline-flex items-center px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-300 font-medium"
              onClick={() => (window.location.href = "/products")}
            >
              {isHalloweenMode ? "🎃 View All Spooky Products" : "View All Products"}
            </HalloweenButton>
          </div>
        </div>
      </section>
    </div>
  );
};
