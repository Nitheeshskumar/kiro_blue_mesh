import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, MapPin, X } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { OrderStory } from "../components/OrderStory";
import { ProductPreview } from "../components/ProductPreview";
import { PRICING, formatPrice } from "../constants/pricing";
import { SavedAddress } from "../types";

interface ValidationError {
  field: string;
  message: string;
}

// Indian states for validation
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Puducherry",
  "Andaman and Nicobar Islands",
];

// Validation functions
const validateName = (name: string): string | null => {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters long";
  if (name.trim().length > 50) return "Name must be less than 50 characters";
  if (!/^[a-zA-Z\s.]+$/.test(name.trim()))
    return "Name can only contain letters, spaces, and dots";
  return null;
};

const validateIndianPhone = (phone: string): string | null => {
  if (!phone.trim()) return "Phone number is required";

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");

  // Check if it's a valid Indian mobile number
  if (cleanPhone.length === 10) {
    // Indian mobile numbers start with 6, 7, 8, or 9
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return "Please enter a valid Indian mobile number";
    }
  } else if (cleanPhone.length === 12) {
    // With country code +91
    if (!/^91[6-9]\d{9}$/.test(cleanPhone)) {
      return "Please enter a valid Indian mobile number with country code (+91)";
    }
  } else if (cleanPhone.length === 13) {
    // With country code 0091
    if (!/^0091[6-9]\d{9}$/.test(cleanPhone)) {
      return "Please enter a valid Indian mobile number";
    }
  } else {
    return "Please enter a valid Indian mobile number (10 digits or with country code +91)";
  }

  return null;
};

const validateIndianPincode = (pincode: string): string | null => {
  if (!pincode.trim()) return "Pincode is required";

  const cleanPincode = pincode.trim();

  // Indian pincode is exactly 6 digits
  if (!/^\d{6}$/.test(cleanPincode)) {
    return "Please enter a valid 6-digit Indian pincode";
  }

  // First digit should be 1-9 (no pincode starts with 0)
  if (cleanPincode[0] === "0") {
    return "Invalid pincode format";
  }

  return null;
};

const validateAddress = (address: string): string | null => {
  if (!address.trim()) return "Address is required";
  if (address.trim().length < 10)
    return "Please provide a complete address (minimum 10 characters)";
  if (address.trim().length > 200)
    return "Address is too long (maximum 200 characters)";
  return null;
};

const validateCity = (city: string): string | null => {
  if (!city.trim()) return "City is required";
  if (city.trim().length < 2) return "City name must be at least 2 characters";
  if (city.trim().length > 50) return "City name is too long";
  if (!/^[a-zA-Z\s.-]+$/.test(city.trim()))
    return "City name can only contain letters, spaces, dots, and hyphens";
  return null;
};

const validateState = (state: string): string | null => {
  if (!state.trim()) return "State is required";

  // Check if it's a valid Indian state
  const normalizedState = state.trim();
  const isValidState = INDIAN_STATES.some(
    (validState) => validState.toLowerCase() === normalizedState.toLowerCase()
  );

  if (!isValidState) {
    return "Please select a valid Indian state";
  }

  return null;
};

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const validateShippingInfo = (info: ShippingInfo): ValidationError[] => {
  const errors: ValidationError[] = [];

  const nameError = validateName(info.name);
  if (nameError) errors.push({ field: "name", message: nameError });

  const phoneError = validateIndianPhone(info.phone);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  const addressError = validateAddress(info.address);
  if (addressError) errors.push({ field: "address", message: addressError });

  const cityError = validateCity(info.city);
  if (cityError) errors.push({ field: "city", message: cityError });

  const stateError = validateState(info.state);
  if (stateError) errors.push({ field: "state", message: stateError });

  const pincodeError = validateIndianPincode(info.zipCode);
  if (pincodeError) errors.push({ field: "zipCode", message: pincodeError });

  return errors;
};

export const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [itemStories, setItemStories] = useState<Record<string, string>>({});

  // Fetch saved addresses and stories
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch saved addresses
      try {
        const addressResponse = await api.get("/addresses");
        const addresses = addressResponse.data;
        setSavedAddresses(addresses);

        // Auto-select default address
        const defaultAddress = addresses.find(
          (addr: SavedAddress) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setShippingInfo({
            name: defaultAddress.fullName,
            phone: defaultAddress.phone,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipCode,
            country: defaultAddress.country,
          });
        } else if (addresses.length === 0) {
          setUseNewAddress(true);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        setUseNewAddress(true);
      }
    };

    fetchData();
  }, [user]);

  // Fetch stories for cart items
  useEffect(() => {
    const fetchStories = async () => {
      if (!user || items.length === 0) return;

      try {
        const stories: Record<string, string> = {};
        for (const item of items) {
          const response = await api.get(
            `/customizations/${item.customizationId}`
          );
          const story =
            response.data.embroidery?.story ||
            "Your unique design awaits its story...";
          stories[item.id] = story;
        }
        setItemStories(stories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      }
    };

    fetchStories();
  }, [items, user]);

  // Helper function to get error for a specific field
  const getFieldError = (fieldName: string): string | null => {
    const error = validationErrors.find((err) => err.field === fieldName);
    return error ? error.message : null;
  };

  // Helper function to clear error for a specific field
  const clearFieldError = (fieldName: string) => {
    setValidationErrors((prev) =>
      prev.filter((err) => err.field !== fieldName)
    );
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  // Enhanced input change handlers with validation
  const handleInputChange = (
    field: keyof typeof shippingInfo,
    value: string
  ) => {
    let processedValue = value;

    // Special processing for phone numbers
    if (field === "phone") {
      // Allow only digits, +, and spaces for phone input
      processedValue = value.replace(/[^\d+\s-]/g, "");
    }

    // Special processing for pincode
    if (field === "zipCode") {
      // Allow only digits for pincode
      processedValue = value.replace(/\D/g, "");
    }

    setShippingInfo((prev) => ({ ...prev, [field]: processedValue }));

    // Clear validation error for this field when user starts typing
    clearFieldError(field);

    // Real-time validation for specific fields
    if (field === "phone" && processedValue.length >= 10) {
      const phoneError = validateIndianPhone(processedValue);
      if (phoneError) {
        setValidationErrors((prev) => [
          ...prev.filter((err) => err.field !== "phone"),
          { field: "phone", message: phoneError },
        ]);
      }
    }

    if (field === "zipCode" && processedValue.length === 6) {
      const pincodeError = validateIndianPincode(processedValue);
      if (pincodeError) {
        setValidationErrors((prev) => [
          ...prev.filter((err) => err.field !== "zipCode"),
          { field: "zipCode", message: pincodeError },
        ]);
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    const address = savedAddresses.find((addr) => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setValidationErrors([]); // Clear validation errors when using saved address
      setShippingInfo({
        name: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      });
    }
  };

  const handleClearAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setValidationErrors([]); // Clear validation errors when switching to new address
    setShippingInfo({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (items.length === 0) return;

    // Comprehensive validation
    const errors = validateShippingInfo(shippingInfo);

    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to first error field
      const firstErrorField = errors[0].field;
      const errorElement = document.querySelector(
        `[data-field="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        customizationId: item.customizationId,
        quantity: item.quantity,
      }));

      // Clean phone number before sending
      const cleanedShippingInfo = {
        ...shippingInfo,
        phone: shippingInfo.phone.replace(/\D/g, ""), // Remove non-digits
        zipCode: shippingInfo.zipCode.trim(),
      };

      const response = await api.post("/orders", {
        items: orderItems,
        shippingInfo: cleanedShippingInfo,
        contactMethod: "INSTAGRAM", // Set contact method
      });

      const { order } = response.data;

      // Clear cart and validation errors, then redirect
      clearCart();
      setValidationErrors([]);
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 mb-8">
          Add some custom clothing to get started!
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20">
                    <ProductPreview
                      productImage={item.previewUrl}
                      productName={item.productName}
                      size={item.size}
                      color={item.color}
                      embroidery={item.embroidery}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Story for this item */}
              {itemStories[item.id] && (
                <OrderStory
                  story={itemStories[item.id]}
                  productName={item.productName}
                  customization={{
                    size: item.size,
                    color: item.color,
                    embroidery: item.embroidery,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{PRICING.STANDARD_SHIPPING.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>
                  ₹{(getTotalPrice() + PRICING.STANDARD_SHIPPING).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Errors Summary */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Info */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !useNewAddress && (
              <div className="space-y-3 mb-4">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {address.fullName}
                        </p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.address}, {address.city}, {address.state}{" "}
                          {address.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleClearAddress}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
                >
                  + Use a different address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(useNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-3">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      New Address
                    </span>
                    <button
                      onClick={() => {
                        setUseNewAddress(false);
                        if (savedAddresses.length > 0) {
                          const defaultAddr =
                            savedAddresses.find((a) => a.isDefault) ||
                            savedAddresses[0];
                          handleAddressSelect(defaultAddr.id);
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={shippingInfo.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    data-field="name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      getFieldError("name")
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("name") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("name")}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number * (10 digits or +91 XXXXXXXXXX)"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    data-field="phone"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      getFieldError("phone")
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("phone") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("phone")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter 10-digit mobile number or with country code (+91)
                  </p>
                </div>

                <div>
                  <textarea
                    placeholder="Complete Address * (House/Flat No., Street, Area, Landmark)"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    data-field="address"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      getFieldError("address")
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("address") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("address")}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="City *"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      data-field="city"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        getFieldError("city")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {getFieldError("city") && (
                      <p className="mt-1 text-sm text-red-600">
                        {getFieldError("city")}
                      </p>
                    )}
                  </div>

                  <div>
                    <select
                      value={shippingInfo.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      data-field="state"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        getFieldError("state")
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select State *</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {getFieldError("state") && (
                      <p className="mt-1 text-sm text-red-600">
                        {getFieldError("state")}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Pincode * (6 digits)"
                    value={shippingInfo.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    data-field="zipCode"
                    maxLength={6}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      getFieldError("zipCode")
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {getFieldError("zipCode") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("zipCode")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter 6-digit Indian postal code
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Instagram Order Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  📱 Next: Confirm on Instagram
                </p>
                <p className="text-xs text-gray-700">
                  After checkout, you'll be redirected to Instagram to confirm
                  your order and receive payment details. Your order will be
                  confirmed once we connect!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || validationErrors.length > 0}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
              loading || validationErrors.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : validationErrors.length > 0 ? (
              "Please fix errors above"
            ) : (
              "Proceed to Checkout"
            )}
          </button>

          {/* Form validation helper text */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mt-2">
              All fields marked with * are required. We validate Indian
              addresses, phone numbers, and pincodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
