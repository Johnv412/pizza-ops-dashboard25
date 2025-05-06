import { useState } from 'react';
import integrationService from '../services/integrationService';

/**
 * Order Form Component
 * 
 * This component provides a form interface for creating new orders
 * and submitting them to the Square POS system through the integration service.
 * 
 * Features:
 * - Customer information collection
 * - Dynamic order item management (add/remove items)
 * - Order total calculation
 * - Additional order details (notes, delivery address, payment method)
 * - Integration with Square POS for order processing
 * - Order status tracking and success/error handling
 * 
 * @component
 */
const OrderForm = () => {
  /**
   * Order form state
   * Contains all form fields for customer information, order items, and additional details
   * 
   * @type {Object}
   * @property {string} customerName - Customer's full name
   * @property {string} customerEmail - Customer's email address
   * @property {string} customerPhone - Customer's phone number
   * @property {Array<Object>} items - Array of order items
   * @property {string} notes - Additional order notes
   * @property {string} deliveryAddress - Delivery address for the order
   * @property {string} paymentMethod - Selected payment method (card, cash, online)
   */
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    notes: '',
    deliveryAddress: '',
    paymentMethod: 'card'
  });
  
  /**
   * Order processing state
   * Tracks the submission process and displays appropriate UI based on status
   * 
   * @type {Object}
   * @property {boolean} isSubmitting - Whether the form is currently being submitted
   * @property {string|null} orderStatus - Current status of the order (null, 'processing', 'success', 'error')
   * @property {Object|null} orderResponse - Response data from the Square POS system
   * @property {string|null} error - Error message if submission fails
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // null, 'processing', 'success', 'error'
  const [orderResponse, setOrderResponse] = useState(null);
  const [error, setError] = useState(null);
  
  /**
   * Handles changes to basic form inputs
   * Updates the orderData state with the new value
   * 
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Handles changes to order item fields
   * Updates the specific item in the items array
   * 
   * @param {number} index - Index of the item in the items array
   * @param {string} field - Field name to update (name, quantity, price)
   * @param {string|number} value - New value for the field
   */
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  /**
   * Adds a new empty item to the order
   * Appends a new item object to the items array
   */
  const addItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };
  
  /**
   * Removes an item from the order
   * Prevents removing the last item to maintain at least one item in the order
   * 
   * @param {number} index - Index of the item to remove
   */
  const removeItem = (index) => {
    if (orderData.items.length === 1) {
      return; // Keep at least one item
    }
    
    const updatedItems = [...orderData.items];
    updatedItems.splice(index, 1);
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  /**
   * Calculates the total price of the order
   * Sums the price * quantity for each item
   * 
   * @returns {string} Formatted total price with 2 decimal places
   */
  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0).toFixed(2);
  };
  
  /**
   * Handles form submission
   * Validates form data, submits to Square POS, and handles response
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!orderData.customerName) {
      setError('Customer name is required');
      return;
    }
    
    if (orderData.items.some(item => !item.name || item.quantity < 1 || item.price <= 0)) {
      setError('All items must have a name, quantity, and price');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setOrderStatus('processing');
      
      // Send order to Square POS using integration service
      const result = await integrationService.send('square', 'orders/create', orderData);
      
      setOrderResponse(result);
      setOrderStatus('success');
      
      // Reset form after successful submission
      setOrderData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        items: [{ name: '', quantity: 1, price: 0 }],
        notes: '',
        deliveryAddress: '',
        paymentMethod: 'card'
      });
    } catch (err) {
      console.error('Order submission error:', err);
      setOrderStatus('error');
      setError(err.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Closes the success message and resets order status
   * Allows creating a new order after successful submission
   */
  const handleCloseSuccess = () => {
    setOrderStatus(null);
    setOrderResponse(null);
  };
  
  return (
    <div className="order-form-container">
      <h2>Create New Order</h2>
      
      {/* Error message display */}
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {/* Success message display */}
      {orderStatus === 'success' && (
        <div className="success-message">
          <h3>Order Successfully Processed!</h3>
          <p>Order ID: {orderResponse.orderId}</p>
          <p>Status: {orderResponse.status}</p>
          {orderResponse.receiptUrl && (
            <p>
              <a href={orderResponse.receiptUrl} target="_blank" rel="noopener noreferrer">
                View Receipt
              </a>
            </p>
          )}
          <button onClick={handleCloseSuccess} className="close-button">
            Create New Order
          </button>
        </div>
      )}
      
      {/* Order form */}
      {orderStatus !== 'success' && (
        <form onSubmit={handleSubmit} className="order-form">
          {/* Customer Information Section */}
          <div className="form-section">
            <h3>Customer Information</h3>
            
            <div className="form-group">
              <label htmlFor="customerName">Name:</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={orderData.customerName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customerEmail">Email:</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={orderData.customerEmail}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="customerPhone">Phone:</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={orderData.customerPhone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Order Items Section */}
          <div className="form-section">
            <h3>Order Items</h3>
            
            {orderData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label htmlFor={`item-name-${index}`}>Item:</label>
                  <input
                    type="text"
                    id={`item-name-${index}`}
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="form-group quantity">
                  <label htmlFor={`item-quantity-${index}`}>Qty:</label>
                  <input
                    type="number"
                    id={`item-quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="form-group price">
                  <label htmlFor={`item-price-${index}`}>Price:</label>
                  <input
                    type="number"
                    id={`item-price-${index}`}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <button
                  type="button"
                  className="remove-item-button"
                  onClick={() => removeItem(index)}
                  disabled={isSubmitting || orderData.items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="add-item-button"
              onClick={addItem}
              disabled={isSubmitting}
            >
              Add Item
            </button>
            
            <div className="order-total">
              <strong>Total:</strong> ${calculateTotal()}
            </div>
          </div>
          
          {/* Additional Information Section */}
          <div className="form-section">
            <h3>Additional Information</h3>
            
            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address:</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={orderData.deliveryAddress}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Order Notes:</label>
              <textarea
                id="notes"
                name="notes"
                value={orderData.notes}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method:</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={orderData.paymentMethod}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="card">Credit/Debit Card</option>
                <option value="cash">Cash</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-order-button"
              disabled={isSubmitting}
            >
              {orderStatus === 'processing' ? 'Processing...' : 'Submit Order'}
            </button>
          </div>
        </form>
      )}
      
      {/* Processing Overlay */}
      {orderStatus === 'processing' && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <p>Processing your order with Square POS...</p>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
