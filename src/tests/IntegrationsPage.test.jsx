// src/tests/IntegrationsPage.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IntegrationsPage from '../pages/IntegrationsPage';
import integrationService from '../services/integrationService';

// Mock the integration service
vi.mock('../services/integrationService', () => ({
  default: {
    getAdapters: vi.fn(),
    getConnections: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    registerWebhook: vi.fn()
  }
}));

// Mock the WebhookEventsComponent
vi.mock('../components/WebhookEventsComponent', () => ({
  default: () => <div data-testid="webhook-events-component">Webhook Events Component</div>
}));

describe('IntegrationsPage', () => {
  // Mock data for tests
  const mockAdapters = [
    {
      id: 'square',
      name: 'Square POS',
      requiredCredentials: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'locationId', label: 'Location ID', type: 'text', required: true }
      ]
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      requiredCredentials: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true }
      ]
    }
  ];

  const mockConnections = [
    {
      id: 'conn_123',
      name: 'Square POS',
      system: 'square',
      status: 'active',
      connectedAt: '2025-04-01T12:00:00Z',
      lastSync: '2025-04-28T10:30:00Z'
    }
  ];

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    integrationService.getAdapters.mockResolvedValue(mockAdapters);
    integrationService.getConnections.mockResolvedValue(mockConnections);
    integrationService.connect.mockResolvedValue({ id: 'conn_456', status: 'active' });
    integrationService.disconnect.mockResolvedValue({ success: true });
    integrationService.registerWebhook.mockResolvedValue({ id: 'webhook_123' });
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('should render the component with loading state', () => {
    // Override the default mock to delay response
    integrationService.getAdapters.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    integrationService.getConnections.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    
    render(<IntegrationsPage />);
    
    // Check if loading state is displayed
    expect(screen.getByText(/Loading integration data/i)).toBeInTheDocument();
  });

  it('should render active connections', async () => {
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Active Connections/i)).toBeInTheDocument();
    });
    
    // Check connection details
    expect(screen.getByText(/System: square/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/Connected:/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Sync:/i)).toBeInTheDocument();
  });

  it('should render "no connections" message when there are no connections', async () => {
    // Override the default mock to return empty array
    integrationService.getConnections.mockResolvedValue([]);
    
    render(<IntegrationsPage />);
    
    // Wait for data to load and check for no connections message
    await waitFor(() => {
      expect(screen.getByText(/No active connections/i)).toBeInTheDocument();
    });
  });

  it('should render adapter options in the select dropdown', async () => {
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('-- Select a system --')).toBeInTheDocument();
    });
    
    // Open the dropdown
    const selectElement = screen.getByLabelText(/Select System/i);
    fireEvent.click(selectElement);
    
    // Check if adapter options are rendered
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    expect(options.some(option => option.textContent === 'Square POS')).toBeTruthy();
    expect(options.some(option => option.textContent === 'SendGrid')).toBeTruthy();
  });

  it('should show credential fields when an adapter is selected', async () => {
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Select System/i)).toBeInTheDocument();
    });
    
    // Select an adapter
    const selectElement = screen.getByLabelText(/Select System/i);
    await user.selectOptions(selectElement, 'square');
    
    // Check if credential fields are rendered
    expect(screen.getByText('Credentials')).toBeInTheDocument();
    expect(screen.getByLabelText(/API Key:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location ID:/i)).toBeInTheDocument();
  });

  it('should handle form submission for connecting to a system', async () => {
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Select System/i)).toBeInTheDocument();
    });
    
    // Select an adapter
    const selectElement = screen.getByLabelText(/Select System/i);
    await user.selectOptions(selectElement, 'square');
    
    // Fill in credentials
    await user.type(screen.getByLabelText(/API Key:/i), 'test-api-key');
    await user.type(screen.getByLabelText(/Location ID:/i), 'test-location');
    
    // Submit the form
    const connectButton = screen.getAllByRole('button').find(button => 
      button.textContent === 'Connect' && !button.disabled
    );
    await user.click(connectButton);
    
    // Check if the service was called with correct parameters
    expect(integrationService.connect).toHaveBeenCalledWith('square', {
      apiKey: 'test-api-key',
      locationId: 'test-location'
    });
    
    // Check if connections are refreshed
    expect(integrationService.getConnections).toHaveBeenCalledTimes(2); // Initial load + refresh
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully connected to square/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when connecting to a system', async () => {
    // Override the default mock to reject
    integrationService.connect.mockRejectedValue({
      response: { data: { message: 'Invalid API key' } }
    });
    
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Select System/i)).toBeInTheDocument();
    });
    
    // Select an adapter
    const selectElement = screen.getByLabelText(/Select System/i);
    await user.selectOptions(selectElement, 'square');
    
    // Fill in credentials
    await user.type(screen.getByLabelText(/API Key:/i), 'invalid-key');
    await user.type(screen.getByLabelText(/Location ID:/i), 'test-location');
    
    // Submit the form
    const connectButton = screen.getAllByRole('button').find(button => 
      button.textContent === 'Connect' && !button.disabled
    );
    await user.click(connectButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid API key/i)).toBeInTheDocument();
    });
  });

  it('should handle disconnecting from a system', async () => {
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Active Connections/i)).toBeInTheDocument();
    });
    
    // Click disconnect button
    const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
    await user.click(disconnectButton);
    
    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to disconnect this integration?');
    
    // Check if the service was called with correct parameters
    expect(integrationService.disconnect).toHaveBeenCalledWith('conn_123');
    
    // Check if connections are refreshed
    expect(integrationService.getConnections).toHaveBeenCalledTimes(2); // Initial load + refresh
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully disconnected/i)).toBeInTheDocument();
    });
  });

  it('should handle webhook registration', async () => {
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Webhook Path:/i)).toBeInTheDocument();
    });
    
    // Fill in webhook form
    await user.type(screen.getByLabelText(/Webhook Path:/i), '/api/webhooks/orders');
    await user.type(screen.getByLabelText(/Description:/i), 'Webhook for order notifications');
    
    // Select events (multi-select)
    const eventsSelect = screen.getByLabelText(/Events/i);
    await user.selectOptions(eventsSelect, ['order.created']);
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /Register Webhook/i });
    await user.click(registerButton);
    
    // Check if the service was called with correct parameters
    expect(integrationService.registerWebhook).toHaveBeenCalledWith(
      '/api/webhooks/orders',
      {
        description: 'Webhook for order notifications',
        events: ['order.created']
      }
    );
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully registered webhook/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when registering a webhook', async () => {
    // Override the default mock to reject
    integrationService.registerWebhook.mockRejectedValue({
      response: { data: { message: 'Invalid webhook path' } }
    });
    
    const user = userEvent.setup();
    render(<IntegrationsPage />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Webhook Path:/i)).toBeInTheDocument();
    });
    
    // Fill in webhook form
    await user.type(screen.getByLabelText(/Webhook Path:/i), 'invalid-path');
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /Register Webhook/i });
    await user.click(registerButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid webhook path/i)).toBeInTheDocument();
    });
  });

  it('should handle API error when fetching data', async () => {
    // Override the default mocks to reject
    integrationService.getAdapters.mockRejectedValue(new Error('Network error'));
    integrationService.getConnections.mockRejectedValue(new Error('Network error'));
    
    render(<IntegrationsPage />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load integration data/i)).toBeInTheDocument();
    });
  });
});
