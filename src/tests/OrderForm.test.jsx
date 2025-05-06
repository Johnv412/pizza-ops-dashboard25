// src/tests/OrderForm.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderForm from '../components/OrderForm';
import integrationService from '../services/integrationService';

// Mock the integration service
vi.mock('../services/integrationService', () => ({
  default: {
    send: vi.fn()
  }
}));

describe('OrderForm', () => {
  // Mock data for tests
  const mockOrderResponse = {
    orderId: 'order_123',
    status: 'success',
    receiptUrl: 'https://receipt.example.com/order_123'
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation
    integrationService.send.mockResolvedValue(mockOrderResponse);
  });

  it('should render the order form', () => {
    render(<OrderForm />);
    
    // Check if form sections are rendered
    expect(screen.getByText('Create New Order')).toBeInTheDocument();
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Order Items')).toBeInTheDocument();
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    
    // Check if form fields are rendered
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Item:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Qty:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delivery Address:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Order Notes:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method:/i)).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Order/i })).toBeInTheDocument();
  });

  it('should add and remove order items', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);
    
    // Initially there should be one item
    expect(screen.getAllByLabelText(/Item:/i)).toHaveLength(1);
    
    // Add an item
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    await user.click(addButton);
    
    // Now there should be two items
    expect(screen.getAllByLabelText(/Item:/i)).toHaveLength(2);
    
    // Remove the second item
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
    await user.click(removeButtons[1]);
    
    // Now there should be one item again
    expect(screen.getAllByLabelText(/Item:/i)).toHaveLength(1);
    
    // Try to remove the last item (should not work)
    await user.click(screen.getByRole('button', { name: /Remove/i }));
    
    // Still should have one item
    expect(screen.getAllByLabelText(/Item:/i)).toHaveLength(1);
  });

  it('should calculate the total price correctly', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);
    
    // Fill in item details
    const itemNameInput = screen.getByLabelText(/Item:/i);
    const quantityInput = screen.getByLabelText(/Qty:/i);
    const priceInput = screen.getByLabelText(/Price:/i);
    
    await user.type(itemNameInput, 'Pizza');
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    await user.clear(priceInput);
    await user.type(priceInput, '10.99');
    
    // Check if total is calculated correctly
    const totalElement = screen.getByText(/Total:/i);
    expect(totalElement.textContent).toContain('21.98');
  });
});
