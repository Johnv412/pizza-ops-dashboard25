# Testing Strategy for AI-Integrated Pizza Operations Dashboard

## 1. API Integration Testing

Since your AI employees (Manus, Roo, and Grok) communicate via APIs and webhooks, we need to thoroughly test these integration points:

```javascript
// src/tests/integration/aiIntegration.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import Dashboard from '../../pages/Dashboard';

// Mock the API responses from AI employees
const server = setupServer(
  // Manus (Lead Importer AI) status endpoint
  rest.get('/api/ai/manus/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'active',
        currentTask: 'importing_pizza_shops',
        progress: 75,
        lastUpdated: '2025-04-29T14:30:00Z',
        recentActivity: [
          { 
            action: 'imported_shop', 
            details: 'Mario\'s Pizza', 
            timestamp: '2025-04-29T14:29:50Z' 
          },
          { 
            action: 'imported_shop', 
            details: 'Slice of Heaven', 
            timestamp: '2025-04-29T14:29:45Z' 
          }
        ]
      })
    );
  }),
  
  // Roo (Workflow Automation AI) status endpoint
  rest.get('/api/ai/roo/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'active',
        currentTask: 'syncing_data_to_instawp',
        progress: 62,
        lastUpdated: '2025-04-29T14:30:05Z',
        activeWorkflows: [
          { 
            id: 'wf-124', 
            name: 'data_sync', 
            status: 'in_progress' 
          },
          { 
            id: 'wf-125', 
            name: 'outreach_automation', 
            status: 'queued' 
          }
        ]
      })
    );
  }),
  
  // Grok (Content Creation AI) status endpoint
  rest.get('/api/ai/grok/status', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'active',
        currentTask: 'generating_shop_descriptions',
        progress: 40,
        lastUpdated: '2025-04-29T14:29:55Z',
        contentQueue: [
          { 
            id: 'content-45', 
            type: 'shop_description', 
            status: 'in_progress', 
            target: 'Mario\'s Pizza' 
          },
          { 
            id: 'content-46', 
            type: 'shop_description', 
            status: 'queued', 
            target: 'Slice of Heaven' 
          }
        ]
      })
    );
  }),
  
  // Webhook trigger endpoint (for testing AI communication)
  rest.post('/api/webhook/task-complete', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Webhook received and processed',
        taskId: req.body.taskId,
        nextAction: 'notify_roo'
      })
    );
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AI Integration Dashboard', () => {
  it('displays AI employees status correctly', async () => {
    render(<Dashboard />);
    
    // Wait for API calls to resolve
    await waitFor(() => {
      // Check if Manus status is displayed
      expect(screen.getByText('Manus')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Importing Pizza Shops')).toBeInTheDocument();
      
      // Check if Roo status is displayed
      expect(screen.getByText('Roo')).toBeInTheDocument();
      expect(screen.getByText('62%')).toBeInTheDocument();
      expect(screen.getByText('Syncing Data to InstaWP')).toBeInTheDocument();
      
      // Check if Grok status is displayed
      expect(screen.getByText('Grok')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('Generating Shop Descriptions')).toBeInTheDocument();
    });
  });
  
  it('handles AI employee status errors correctly', async () => {
    // Override one of the handlers to simulate an error
    server.use(
      rest.get('/api/ai/manus/status', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: 'Internal server error',
            message: 'Failed to fetch Manus status'
          })
        );
      })
    );
    
    render(<Dashboard />);
    
    // Wait for API calls to resolve
    await waitFor(() => {
      // Check if error message is displayed for Manus
      expect(screen.getByText('Failed to fetch Manus status')).toBeInTheDocument();
      
      // Check if other AI employees are still displayed correctly
      expect(screen.getByText('Roo')).toBeInTheDocument();
      expect(screen.getByText('Grok')).toBeInTheDocument();
    });
  });
  
  it('updates dashboard when new AI activity is reported', async () => {
    const { rerender } = render(<Dashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Manus')).toBeInTheDocument();
    });
    
    // Simulate new activity from Manus
    server.use(
      rest.get('/api/ai/manus/status', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            status: 'active',
            currentTask: 'importing_pizza_shops',
            progress: 80, // Progress increased
            lastUpdated: '2025-04-29T14:31:00Z',
            recentActivity: [
              { 
                action: 'imported_shop', 
                details: 'Pizza Paradise', // New shop
                timestamp: '2025-04-29T14:30:50Z' 
              },
              { 
                action: 'imported_shop', 
                details: 'Mario\'s Pizza', 
                timestamp: '2025-04-29T14:29:50Z' 
              }
            ]
          })
        );
      })
    );
    
    // Trigger re-render (in a real app, this would be done via polling or websockets)
    rerender(<Dashboard />);
    
    // Check if the dashboard shows updated information
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument(); // Updated progress
      expect(screen.getByText('Pizza Paradise')).toBeInTheDocument(); // New shop
    });
  });
});
```

## 2. Testing Webhook Communication

Since your AI employees communicate via webhooks, we need to test this special functionality:

```javascript
// src/tests/integration/webhookCommunication.test.js
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { sendWebhook, processWebhookResponse } from '../../services/webhookService';

// Mock axios
vi.mock('axios');

describe('Webhook Communication Between AI Employees', () => {
  it('sends webhook correctly when Manus completes a task', async () => {
    // Setup mock response
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Webhook received by Roo',
        nextSteps: ['sync_to_instawp', 'notify_admin']
      }
    });
    
    // Test sending webhook from Manus to Roo
    const result = await sendWebhook('manus_complete', {
      taskType: 'import',
      shops: ['Mario\'s Pizza', 'Slice of Heaven'],
      timestamp: '2025-04-29T14:35:00Z'
    });
    
    // Verify the webhook was sent correctly
    expect(axios.post).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/manus_complete',
      {
        taskType: 'import',
        shops: ['Mario\'s Pizza', 'Slice of Heaven'],
        timestamp: '2025-04-29T14:35:00Z'
      },
      expect.any(Object) // Headers and other config
    );
    
    // Verify the response was processed correctly
    expect(result.success).toBe(true);
    expect(result.nextSteps).toContain('sync_to_instawp');
    expect(result.nextSteps).toContain('notify_admin');
  });
  
  it('handles webhook processing errors gracefully', async () => {
    // Setup mock error response
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    
    // Test error handling
    await expect(
      sendWebhook('manus_complete', {
        taskType: 'import',
        shops: ['Mario\'s Pizza'],
        timestamp: '2025-04-29T14:35:00Z'
      })
    ).rejects.toThrow('Failed to send webhook: Network Error');
  });
  
  it('processes incoming webhooks from AI employees', () => {
    // Simulate an incoming webhook from Roo
    const webhookData = {
      sender: 'roo',
      action: 'data_synced',
      details: {
        syncedShops: 5,
        failedShops: 0,
        timestamp: '2025-04-29T14:40:00Z'
      }
    };
    
    // Process the webhook
    const result = processWebhookResponse(webhookData);
    
    // Verify processing
    expect(result.actionRequired).toBe(false);
    expect(result.status).toBe('success');
    expect(result.message).toBe('5 shops synced successfully');
  });
  
  it('detects when human intervention is needed from webhook data', () => {
    // Simulate an incoming webhook that requires attention
    const webhookData = {
      sender: 'grok',
      action: 'content_generation_issue',
      details: {
        shopName: 'Luigi\'s Pizzeria',
        issue: 'Insufficient information to generate description',
        timestamp: '2025-04-29T14:45:00Z'
      },
      requiresAttention: true
    };
    
    // Process the webhook
    const result = processWebhookResponse(webhookData);
    
    // Verify processing detects need for human intervention
    expect(result.actionRequired).toBe(true);
    expect(result.status).toBe('attention_needed');
    expect(result.message).toBe('Content generation issue for Luigi\'s Pizzeria');
    expect(result.priority).toBe('medium');
  });
});
```

## 3. Testing Real-Time Dashboard Updates

To test the real-time monitoring functionality that's so crucial for your AI employees:

```javascript
// src/tests/components/AIDashboardMonitor.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AIDashboardMonitor from '../../components/dashboard/AIDashboardMonitor';
import { subscribeToAIUpdates } from '../../services/aiMonitoringService';

// Mock the monitoring service
vi.mock('../../services/aiMonitoringService', () => ({
  subscribeToAIUpdates: vi.fn()
}));

describe('AI Dashboard Monitor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('subscribes to AI updates on mount', () => {
    render(<AIDashboardMonitor />);
    
    expect(subscribeToAIUpdates).toHaveBeenCalledTimes(1);
    expect(subscribeToAIUpdates).toHaveBeenCalledWith(expect.any(Function));
  });
  
  it('displays real-time updates from AI employees', async () => {
    // Setup subscription callback
    let subscriptionCallback;
    subscribeToAIUpdates.mockImplementation((callback) => {
      subscriptionCallback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    render(<AIDashboardMonitor />);
    
    // Simulate receiving an update from an AI employee
    act(() => {
      subscriptionCallback({
        source: 'manus',
        type: 'progress_update',
        data: {
          progress: 85,
          message: 'Imported 17/20 pizza shops',
          timestamp: '2025-04-29T15:00:00Z'
        }
      });
    });
    
    // Check if the update is displayed
    expect(screen.getByText('Manus')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('Imported 17/20 pizza shops')).toBeInTheDocument();
    
    // Simulate receiving another update
    act(() => {
      subscriptionCallback({
        source: 'roo',
        type: 'task_completed',
        data: {
          task: 'data_sync',
          result: 'success',
          message: 'Successfully synced all pizza shops to InstaWP',
          timestamp: '2025-04-29T15:01:00Z'
        }
      });
    });
    
    // Check if both updates are displayed
    expect(screen.getByText('Roo')).toBeInTheDocument();
    expect(screen.getByText('Successfully synced all pizza shops to InstaWP')).toBeInTheDocument();
  });
  
  it('shows notifications for high-priority alerts', async () => {
    // Setup subscription callback
    let subscriptionCallback;
    subscribeToAIUpdates.mockImplementation((callback) => {
      subscriptionCallback = callback;
      return () => {}; // Return unsubscribe function
    });
    
    render(<AIDashboardMonitor />);
    
    // Simulate receiving a high-priority alert
    act(() => {
      subscriptionCallback({
        source: 'grok',
        type: 'alert',
        priority: 'high',
        data: {
          message: 'Content generation failed for 3 shops',
          reason: 'API rate limit exceeded',
          timestamp: '2025-04-29T15:05:00Z'
        }
      });
    });
    
    // Check if the alert is displayed prominently
    expect(screen.getByText('High Priority Alert')).toBeInTheDocument();
    expect(screen.getByText('Content generation failed for 3 shops')).toBeInTheDocument();
    expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();
    
    // Check if the notification has the correct styling for high priority
    const alertElement = screen.getByText('High Priority Alert').closest('div');
    expect(alertElement).toHaveClass('bg-red-100');
    expect(alertElement).toHaveClass('border-red-500');
  });
  
  it('unsubscribes from updates on unmount', () => {
    // Setup mock unsubscribe function
    const mockUnsubscribe = vi.fn();
    subscribeToAIUpdates.mockReturnValue(mockUnsubscribe);
    
    // Render and then unmount the component
    const { unmount } = render(<AIDashboardMonitor />);
    unmount();
    
    // Verify unsubscribe was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
```

## 4. Testing Alert System

Testing the alert system that notifies you when human intervention is needed:

```javascript
// src/tests/services/alertService.test.js
import { describe, it, expect, vi } from 'vitest';
import { 
  sendAlert, 
  processAlertPriority,
  shouldNotifyHuman,
  getAlertChannel
} from '../../services/alertService';
import axios from 'axios';

// Mock axios and other external services
vi.mock('axios');

describe('AI Alert Service', () => {
  it('determines alert priority correctly', () => {
    // Test different scenarios
    expect(processAlertPriority({
      type: 'error',
      source: 'manus',
      message: 'Failed to import data',
    })).toBe('high');
    
    expect(processAlertPriority({
      type: 'warning',
      source: 'roo',
      message: 'Slow API response time',
    })).toBe('medium');
    
    expect(processAlertPriority({
      type: 'info',
      source: 'grok',
      message: 'Generated content for 10 shops',
    })).toBe('low');
  });
  
  it('correctly determines when human notification is required', () => {
    // High priority alerts should always notify humans
    expect(shouldNotifyHuman({
      priority: 'high',
      type: 'error',
      message: 'Data import failed completely'
    })).toBe(true);
    
    // Medium priority warnings should notify humans
    expect(shouldNotifyHuman({
      priority: 'medium',
      type: 'warning',
      message: 'Some shops missing contact details'
    })).toBe(true);
    
    // Low priority info should not notify humans
    expect(shouldNotifyHuman({
      priority: 'low',
      type: 'info',
      message: 'Daily import completed successfully'
    })).toBe(false);
  });
  
  it('selects the appropriate notification channel based on alert type', () => {
    // Critical failures should use multiple channels
    expect(getAlertChannel({
      priority: 'high',
      type: 'error',
      message: 'System offline'
    })).toEqual(['email', 'sms', 'slack']);
    
    // Medium priority should use email and slack
    expect(getAlertChannel({
      priority: 'medium',
      type: 'warning',
      message: 'API rate limit approaching'
    })).toEqual(['email', 'slack']);
    
    // Low priority should just use slack
    expect(getAlertChannel({
      priority: 'low',
      type: 'info',
      message: 'Weekly report ready'
    })).toEqual(['slack']);
  });
  
  it('sends alerts via the appropriate channels', async () => {
    // Setup mock responses
    axios.post.mockResolvedValue({ data: { success: true } });
    
    // Send a high priority alert
    await sendAlert({
      priority: 'high',
      type: 'error',
      source: 'manus',
      message: 'Failed to import data from LeadsImporter',
      details: 'API authentication failed',
      timestamp: '2025-04-29T15:30:00Z'
    });
    
    // Verify the alert was sent via multiple channels
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.example.com/notifications/email',
      expect.objectContaining({
        subject: 'HIGH PRIORITY: Manus AI Alert',
        message: expect.stringContaining('Failed to import data from LeadsImporter')
      }),
      expect.any(Object)
    );
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.example.com/notifications/sms',
      expect.objectContaining({
        message: expect.stringContaining('HIGH PRIORITY ALERT: Manus - Failed to import data')
      }),
      expect.any(Object)
    );
    
    expect(axios.post).toHaveBeenCalledWith(
      'https://slack.com/api/chat.postMessage',
      expect.objectContaining({
        channel: 'ai-alerts',
        text: expect.stringContaining('HIGH PRIORITY ALERT'),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            color: '#FF0000',
            title: expect.stringContaining('Manus AI Error')
          })
        ])
      }),
      expect.any(Object)
    );
  });
});
```

## 5. End-to-End Testing with AI Communication

```javascript
// e2e/aiWorkflow.spec.js (using Playwright)
import { test, expect } from '@playwright/test';

// This test simulates a complete workflow between AI employees
test('complete AI workflow from import to content generation', async ({ page }) => {
  // Start on the dashboard page
  await page.goto('http://localhost:5173/');
  
  // Verify the initial dashboard state
  await expect(page.locator('h1')).toContainText('Dashboard');
  
  // Trigger a manual import (this would normally be automated)
  await page.click('button:text("Start Import")');
  
  // Wait for Manus to complete the import and notify Roo
  await expect(page.locator('#manus-status')).toHaveText('Import Complete');
  
  // Verify Roo receives the notification and starts syncing
  await expect(page.locator('#roo-status')).toEventually.toHaveText('Syncing Data');
  
  // Wait for Roo to complete syncing and notify Grok
  await expect(page.locator('#roo-status')).toEventually.toHaveText('Sync Complete');
  
  // Verify Grok starts generating content
  await expect(page.locator('#grok-status')).toEventually.toHaveText('Generating Content');
  
  // Wait for Grok to complete content generation
  await expect(page.locator('#grok-status')).toEventually.toHaveText('Content Complete');
  
  // Verify the workflow completion is recorded
  await expect(page.locator('#workflow-status')).toHaveText('Complete');
  
  // Check the logs to ensure the correct sequence of events
  const logs = await page.locator('#ai-activity-log').allTextContents();
  expect(logs).toContain('Manus started import');
  expect(logs).toContain('Manus completed import');
  expect(logs).toContain('Roo notified of import completion');
  expect(logs).toContain('Roo started syncing');
  expect(logs).toContain('Roo completed syncing');
  expect(logs).toContain('Grok notified to generate content');
  expect(logs).toContain('Grok started content generation');
  expect(logs).toContain('Grok completed content generation');
  expect(logs).toContain('Workflow completed successfully');
});

// Test the human intervention workflow
test('AI workflow requiring human intervention', async ({ page }) => {
  // Start on the dashboard page
  await page.goto('http://localhost:5173/');
  
  // Simulate a scenario where Roo cannot automatically process some data
  await page.evaluate(() => {
    // This would be triggered by the backend in a real scenario
    window.dispatchEvent(new CustomEvent('ai-event', {
      detail: {
        source: 'roo',
        type: 'human_intervention_required',
        priority: 'medium',
        data: {
          reason: 'Duplicate pizza shop entries detected',
          shops: ['Mario\'s Pizza', 'Mario\'s Authentic Pizza'],
          action: 'resolve_duplicates',
          timestamp: '2025-04-29T16:00:00Z'
        }
      }
    }));
  });
  
  // Verify the alert is displayed
  await expect(page.locator('.alert-banner')).toBeVisible();
  await expect(page.locator('.alert-banner')).toContainText('Human intervention required');
  await expect(page.locator('.alert-details')).toContainText('Duplicate pizza shop entries detected');
  
  // Resolve the issue manually
  await page.click('button:text("Resolve Issue")');
  await page.selectOption('#duplicate-resolution-Mario\'s Pizza', 'keep');
  await page.selectOption('#duplicate-resolution-Mario\'s Authentic Pizza', 'merge');
  await page.click('button:text("Confirm Resolution")');
  
  // Verify workflow continues after human intervention
  await expect(page.locator('#roo-status')).toEventually.toHaveText('Continuing Workflow');
  await expect(page.locator('.alert-banner')).not.toBeVisible();
  
  // Verify the resolution is logged
  const logs = await page.locator('#ai-activity-log').allTextContents();
  expect(logs).toContain('Human intervention: Duplicate entries resolved');
  expect(logs).toContain('Workflow resumed after human intervention');
});
```

These tests cover the key aspects of your AI employees system, focusing on:

1. API integration between AI employees
2. Webhook communication for task handoff
3. Real-time dashboard updates
4. Alert system for human intervention
5. End-to-end workflow testing

By implementing these tests, you'll ensure that your Pizza Operations Dashboard properly integrates with your unique AI employee system, providing reliable monitoring and control over your automated processes.
