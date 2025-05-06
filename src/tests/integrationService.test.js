// src/tests/integrationService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import integrationService from '../services/integrationService';

// Mock axios
vi.mock('axios');

describe('Integration Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Clean up after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAdapters', () => {
    it('should fetch adapters successfully', async () => {
      // Mock data
      const mockAdapters = [
        { id: 'square', name: 'Square POS', requiredCredentials: [] },
        { id: 'sendgrid', name: 'SendGrid', requiredCredentials: [] }
      ];

      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: mockAdapters });

      // Call the method
      const result = await integrationService.getAdapters();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/integration/adapters');
      expect(result).toEqual(mockAdapters);
    });

    it('should handle errors when fetching adapters', async () => {
      // Setup mock error
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.getAdapters()).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching adapters:', mockError);
    });
  });

  describe('getConnections', () => {
    it('should fetch connections successfully', async () => {
      // Mock data
      const mockConnections = [
        { id: 'conn_123', system: 'square', status: 'active' },
        { id: 'conn_456', system: 'sendgrid', status: 'active' }
      ];

      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: mockConnections });

      // Call the method
      const result = await integrationService.getConnections();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/integration/connections');
      expect(result).toEqual(mockConnections);
    });

    it('should handle errors when fetching connections', async () => {
      // Setup mock error
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.getConnections()).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching connections:', mockError);
    });
  });

  describe('connect', () => {
    it('should connect to a system successfully', async () => {
      // Mock data
      const system = 'square';
      const credentials = { apiKey: 'test-key', locationId: 'test-location' };
      const mockResponse = { id: 'conn_123', status: 'active' };

      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      // Call the method
      const result = await integrationService.connect(system, credentials);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith(`/api/integration/connect/${system}`, credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when connecting to a system', async () => {
      // Mock data
      const system = 'square';
      const credentials = { apiKey: 'invalid-key' };
      
      // Setup mock error
      const mockError = new Error('Invalid credentials');
      axios.post.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.connect(system, credentials)).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(`Error connecting to ${system}:`, mockError);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from a system successfully', async () => {
      // Mock data
      const connectionId = 'conn_123';
      const mockResponse = { success: true };

      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      // Call the method
      const result = await integrationService.disconnect(connectionId);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith(`/api/integration/disconnect/${connectionId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when disconnecting from a system', async () => {
      // Mock data
      const connectionId = 'conn_123';
      
      // Setup mock error
      const mockError = new Error('Connection not found');
      axios.post.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.disconnect(connectionId)).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(`Error disconnecting connection ${connectionId}:`, mockError);
    });
  });

  describe('send', () => {
    it('should send data to a system successfully', async () => {
      // Mock data
      const system = 'square';
      const endpoint = 'orders/create';
      const data = { customerName: 'John Doe', items: [] };
      const mockResponse = { orderId: 'order_123', status: 'success' };

      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      // Call the method
      const result = await integrationService.send(system, endpoint, data);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith(`/api/integration/send/${system}/${endpoint}`, data);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when sending data to a system', async () => {
      // Mock data
      const system = 'square';
      const endpoint = 'orders/create';
      const data = { customerName: 'John Doe', items: [] };
      
      // Setup mock error
      const mockError = new Error('Invalid order data');
      axios.post.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.send(system, endpoint, data)).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(`Error sending data to ${system}/${endpoint}:`, mockError);
    });
  });

  describe('getWebhooks', () => {
    it('should fetch webhooks successfully', async () => {
      // Mock data
      const mockWebhooks = [
        { id: 'webhook_123', path: '/api/webhooks/orders', events: ['order.created'] },
        { id: 'webhook_456', path: '/api/webhooks/payments', events: ['payment.received'] }
      ];

      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: mockWebhooks });

      // Call the method
      const result = await integrationService.getWebhooks();

      // Assertions
      expect(axios.get).toHaveBeenCalledWith('/api/integration/webhooks');
      expect(result).toEqual(mockWebhooks);
    });

    it('should handle errors when fetching webhooks', async () => {
      // Setup mock error
      const mockError = new Error('Network error');
      axios.get.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.getWebhooks()).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching webhooks:', mockError);
    });
  });

  describe('registerWebhook', () => {
    it('should register a webhook successfully', async () => {
      // Mock data
      const path = '/api/webhooks/orders';
      const options = {
        description: 'Webhook for order notifications',
        events: ['order.created', 'order.updated']
      };
      const mockResponse = { id: 'webhook_123', path, ...options };

      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: mockResponse });

      // Call the method
      const result = await integrationService.registerWebhook(path, options);

      // Assertions
      expect(axios.post).toHaveBeenCalledWith('/api/integration/webhooks/register', { path, ...options });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when registering a webhook', async () => {
      // Mock data
      const path = '/api/webhooks/orders';
      const options = {
        description: 'Webhook for order notifications',
        events: ['order.created', 'order.updated']
      };
      
      // Setup mock error
      const mockError = new Error('Invalid webhook path');
      axios.post.mockRejectedValueOnce(mockError);

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error');

      // Call the method and expect it to throw
      await expect(integrationService.registerWebhook(path, options)).rejects.toThrow();

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith('Error registering webhook:', mockError);
    });
  });
});
