import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  /* Instagram, */
  MessageCircle,
  Save,
  X as CloseIcon,
  Edit2
} from 'lucide-react'
import { api } from '../../lib/api'
import { generateDTDCTrackingUrl } from '../../lib/instagram'

interface Order {
  id: string
  status: string
  totalAmount: number
  trackingCode?: string
  trackingUrl?: string
  adminNotes?: string
  contactMethod?: string
  customerInstagram?: string
  statusHistory?: Array<{
    status: string
    timestamp: string
    previousStatus?: string
  }>
  createdAt: string
  updatedAt: string
  shippingInfo: {
    name?: string
    fullName?: string
    address: string
    city: string
    state: string
    zipCode: string
    phone?: string
  }
  user: {
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
    customization: {
      size: string
      color: string
      embroidery?: {
        text?: string
      }
      previewUrl?: string
    }
  }>
}

const statusIcons = {
  PENDING: Clock,
  PAID: CheckCircle,
  PROCESSING: Package,
  MANUFACTURING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-orange-100 text-orange-800'
}

const ORDER_STATUSES = [
  'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'
]

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [editingTracking, setEditingTracking] = useState<string | null>(null)
  const [trackingValue, setTrackingValue] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus
      })
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status')
    }
  }

  const updateAdminNotes = async (orderId: string, notes: string) => {
    try {
      await api.put(`/admin/orders/${orderId}`, {
        adminNotes: notes
      })
      setEditingNotes(null)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update notes:', error)
      alert('Failed to update notes')
    }
  }

  const updateTracking = async (orderId: string, trackingCode: string) => {
    try {
      const trackingUrl = generateDTDCTrackingUrl(trackingCode)
      await api.put(`/admin/orders/${orderId}`, {
        trackingCode,
        trackingUrl
      })
      setEditingTracking(null)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update tracking:', error)
      alert('Failed to update tracking')
    }
  }

  const startEditingNotes = (order: Order) => {
    setEditingNotes(order.id)
    setNotesValue(order.adminNotes || '')
  }

  const startEditingTracking = (order: Order) => {
    setEditingTracking(order.id)
    setTrackingValue(order.trackingCode || '')
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-8 rounded w-1/3"></div>
          <div className="bg-gray-300 h-64 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          Order Management
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md border">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Orders will appear here when customers place them.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map(order => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package
              const isExpanded = expandedOrder === order.id

              return (
                <div key={order.id} className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.user.name || order.user.email} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[order.status as keyof typeof statusColors]
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        {isExpanded ? <CloseIcon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Status Update */}
                  {!isExpanded && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-600">Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="mt-6 space-y-6">
                      {/* Status Management */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Status</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            statusColors[order.status as keyof typeof statusColors]
                          }`}>
                            Current: {order.status}
                          </span>
                        </div>

                        {/* Status History */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Status History</h5>
                            <div className="space-y-2">
                              {order.statusHistory.map((entry, index) => (
                                <div key={index} className="flex items-center gap-3 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="font-medium">{entry.status}</span>
                                  <span className="text-gray-500">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tracking Information */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Truck className="w-5 h-5" />
                          DTDC Tracking
                        </h4>
                        {editingTracking === order.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={trackingValue}
                              onChange={(e) => setTrackingValue(e.target.value)}
                              placeholder="Enter DTDC tracking code"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => updateTracking(order.id, trackingValue)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTracking(null)}
                              className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              {order.trackingCode ? (
                                <>
                                  <p className="font-mono text-lg font-semibold text-gray-900">
                                    {order.trackingCode}
                                  </p>
                                  {order.trackingUrl && (
                                    <a
                                      href={order.trackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                                    >
                                      Track on DTDC →
                                    </a>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-gray-600">No tracking code added yet</p>
                              )}
                            </div>
                            <button
                              onClick={() => startEditingTracking(order)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Customer Contact */}
                      {order.contactMethod === 'WHATSAPP' && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            WhatsApp Contact
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Customer prefers WhatsApp communication
                          </p>
                        </div>
                      )}
                      {/* Instagram Contact - Temporarily Disabled */}
                      {/* {(order.contactMethod === 'INSTAGRAM' || order.customerInstagram) && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Instagram className="w-5 h-5 text-purple-600" />
                            Instagram Contact
                          </h4>
                          {order.customerInstagram && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Handle:</span> @{order.customerInstagram}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Customer prefers Instagram communication
                          </p>
                        </div>
                      )} */}

                      {/* Order Items */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                        <div className="space-y-4">
                          {order.items.map(item => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  Size: {item.customization.size} | Color: {item.customization.color}
                                </p>
                                {item.customization.embroidery?.text && (
                                  <p className="text-sm text-gray-600">
                                    Embroidery: "{item.customization.embroidery.text}"
                                  </p>
                                )}
                                <p className="text-sm text-gray-900 mt-2">
                                  Qty: {item.quantity} × ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Bill Breakdown */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">
                              ₹{order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-900">₹829.00</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total:</span>
                            <span className="text-primary-600">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-medium">{order.shippingInfo.name || order.shippingInfo.fullName}</p>
                          <p>{order.shippingInfo.address}</p>
                          <p>
                            {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                          </p>
                          {order.shippingInfo.phone && (
                            <p className="mt-2">
                              <span className="font-medium">Phone:</span> {order.shippingInfo.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">Admin Notes (Internal)</h4>
                          {editingNotes !== order.id && (
                            <button
                              onClick={() => startEditingNotes(order)}
                              className="p-1 text-gray-600 hover:text-gray-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {editingNotes === order.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              placeholder="Add internal notes about this order..."
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateAdminNotes(order.id, notesValue)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save Notes
                              </button>
                              <button
                                onClick={() => setEditingNotes(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {order.adminNotes || 'No notes added yet. Click edit to add notes.'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}