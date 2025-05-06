// src/tests/WebhookEventsComponent.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WebhookEventsComponent from '../components/WebhookEventsComponent';
import integrationService from '../services/integrationService';

// Mock the integration service
vi.mock('../services/integrationService', () => ({
  default: {
    getWebhooks: vi.fn()
  }
}));

describe('WebhookEventsComponent', () => {
  // Mock data for tests
  const mockWebhookEvents = [
    {
      id: 'webhook_1',
      source: 'square',
      timestamp: '2025-04-28T10:15:30Z',
      path: '/api/webhooks/orders',
      method: 'POST',
      payload: { orderId: 'order_123', status: 'created' }
    },
    {
      id: 'webhook_2',
      source: 'sendgrid',
      timestamp: '2025-04-28T09:45:20Z',
      path: '/api/webhooks/emails',
      method: 'POST',
      payload: { emailId: 'email_456', status: 'sent' }
    },
    {
      id: 'webhook_3',
      source: 'square',
      timestamp: '2025-04-28T08:30:10Z',
      path: '/api/webhooks/payments',
      method: 'POST',
      payload: { paymentId: 'payment_789', status: 'completed' }
    }
  ];

  // Setup and teardown
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementation
    integrationService.getWebhooks.mockResolvedValue(mockWebhookEvents);
    
    // Mock setInterval and clearInterval
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render the component with loading state', () => {
    // Override the default mock to delay response
    integrationService.getWebhooks.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    
    render(<WebhookEventsComponent />);
    
    // Check if loading state is displayed
    expect(screen.getByText(/Loading webhook events/i)).toBeInTheDocument();
  });

  it('should render webhook events after loading', async () => {
    render(<WebhookEventsComponent />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Check if events are rendered
    expect(screen.getByText('square')).toBeInTheDocument();
    expect(screen.getByText('sendgrid')).toBeInTheDocument();
    expect(screen.getByText('/api/webhooks/orders')).toBeInTheDocument();
    expect(screen.getByText('/api/webhooks/emails')).toBeInTheDocument();
    
    // Check if payload is rendered
    expect(screen.getByText('Payload:')).toBeInTheDocument();
    expect(screen.getByText(/"orderId": "order_123"/)).toBeInTheDocument();
  });

  it('should render "no events" message when there are no events', async () => {
    // Override the default mock to return empty array
    integrationService.getWebhooks.mockResolvedValue([]);
    
    render(<WebhookEventsComponent />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Check if no events message is displayed
    expect(screen.getByText(/No webhook events found/i)).toBeInTheDocument();
  });

  it('should filter events by source', async () => {
    const user = userEvent.setup();
    render(<WebhookEventsComponent />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Initially all events should be visible
    expect(screen.getAllByText(/square|sendgrid/i)).toHaveLength(3);
    
    // Select filter
    const filterSelect = screen.getByLabelText(/Filter by source/i);
    await user.selectOptions(filterSelect, 'square');
    
    // Check if only square events are visible
    expect(screen.getAllByText('square')).toHaveLength(2);
    expect(screen.queryByText('sendgrid')).not.toBeInTheDocument();
  });

  it('should format timestamps correctly', async () => {
    render(<WebhookEventsComponent />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Check if timestamps are formatted
    // Note: The exact format will depend on the locale of the test environment
    // We're just checking that the timestamps are transformed from ISO format
    expect(screen.queryByText('2025-04-28T10:15:30Z')).not.toBeInTheDocument();
    
    // The formatTimestamp function should have converted these to locale strings
    // We can't test the exact output as it depends on the locale, but we can check
    // that the original ISO strings are not present
  });

  it('should handle API error when fetching data', async () => {
    // Override the default mock to reject
    integrationService.getWebhooks.mockRejectedValue(new Error('Network error'));
    
    render(<WebhookEventsComponent />);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load webhook events/i)).toBeInTheDocument();
    });
  });

  it('should poll for new events at regular intervals', async () => {
    render(<WebhookEventsComponent />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Verify initial call
    expect(integrationService.getWebhooks).toHaveBeenCalledTimes(1);
    
    // Fast-forward time by 15 seconds (polling interval)
    vi.advanceTimersByTime(15000);
    
    // Verify second call
    expect(integrationService.getWebhooks).toHaveBeenCalledTimes(2);
    
    // Fast-forward time by another 15 seconds
    vi.advanceTimersByTime(15000);
    
    // Verify third call
    expect(integrationService.getWebhooks).toHaveBeenCalledTimes(3);
  });

  it('should update the UI when new events are received', async () => {
    render(<WebhookEventsComponent />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Webhook Events')).toBeInTheDocument();
    });
    
    // Update mock to return new data for the second call
    const newEvents = [
      ...mockWebhookEvents,
      {
        id: 'webhook_4',
        source: 'stripe',
        timestamp: '2025-04-28T10:30:00Z',
        path: '/api/webhooks/subscriptions',
        method: 'POST',
        payload: { subscriptionId: 'sub_123', status: 'active' }
      }
    ];
    
    integrationService.getWebhooks.mockResolvedValue(newEvents);
    
    // Fast-forward time by 15 seconds (polling interval)
    vi.advanceTimersByTime(15000);
    
    // Wait for UI to update with new data
    await waitFor(() => {
      expect(screen.getByText('stripe')).toBeInTheDocument();
      expect(screen.getByText('/api/webhooks/subscriptions')).toBeInTheDocument();
    });
  });

  it('should clean up interval on component unmount', () => {
    // Spy on clearInterval
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = render(<WebhookEventsComponent />);
    
    // Unmount the component
    unmount();
    
    // Verify clearInterval was called
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
