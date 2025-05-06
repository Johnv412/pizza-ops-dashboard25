import axios from 'axios';

/**
 * Base API URL for all integration endpoints
 * This should be updated based on environment configuration
 * @constant {string}
 */
const API_BASE_URL = '/api/integration';

/**
 * Integration Service
 * 
 * This service handles all communication with the backend integration API,
 * providing methods to manage external system connections, webhooks, and data transfer.
 * 
 * The service abstracts the complexity of API calls and error handling,
 * providing a clean interface for components to interact with backend integrations.
 * 
 * @module integrationService
 */
const integrationService = {
  /**
   * Fetches all available integration adapters from the backend
   * 
   * @async
   * @function getAdapters
   * @returns {Promise<Array>} List of available adapters with their configuration requirements
   * @throws {Error} If the API request fails
   * @example
   * // Get all available adapters
   * const adapters = await integrationService.getAdapters();
   * // adapters = [{ id: 'square', name: 'Square POS', requiredCredentials: [...] }, ...]
   */
  getAdapters: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/adapters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching adapters:', error);
      throw error;
    }
  },

  /**
   * Fetches all active integration connections
   * 
   * @async
   * @function getConnections
   * @returns {Promise<Array>} List of active connections with their status and details
   * @throws {Error} If the API request fails
   * @example
   * // Get all active connections
   * const connections = await integrationService.getConnections();
   * // connections = [{ id: '123', system: 'square', status: 'active', ... }, ...]
   */
  getConnections: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/connections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
  },

  /**
   * Establishes a new connection to an external system
   * 
   * @async
   * @function connect
   * @param {string} system - The system identifier to connect to (e.g., 'square', 'sendgrid')
   * @param {Object} credentials - Authentication credentials for the system
   * @returns {Promise<Object>} Connection details including connection ID and status
   * @throws {Error} If the connection attempt fails or credentials are invalid
   * @example
   * // Connect to Square POS
   * const credentials = { apiKey: 'sk_test_123', locationId: 'L123' };
   * const connection = await integrationService.connect('square', credentials);
   */
  connect: async (system, credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/connect/${system}`, credentials);
      return response.data;
    } catch (error) {
      console.error(`Error connecting to ${system}:`, error);
      throw error;
    }
  },

  /**
   * Terminates an existing connection to an external system
   * 
   * @async
   * @function disconnect
   * @param {string} connectionId - The ID of the connection to disconnect
   * @returns {Promise<Object>} Result of the disconnect operation
   * @throws {Error} If the disconnection fails
   * @example
   * // Disconnect from a system
   * await integrationService.disconnect('conn_123');
   */
  disconnect: async (connectionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/disconnect/${connectionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error disconnecting connection ${connectionId}:`, error);
      throw error;
    }
  },

  /**
   * Sends data to an external system through a specific endpoint
   * 
   * @async
   * @function send
   * @param {string} system - The system identifier to send data to (e.g., 'square', 'sendgrid')
   * @param {string} endpoint - The endpoint to send data to (e.g., 'orders/create', 'email/send')
   * @param {Object} data - The data payload to send
   * @returns {Promise<Object>} Result of the send operation
   * @throws {Error} If the send operation fails
   * @example
   * // Create an order in Square POS
   * const orderData = { customerName: 'John Doe', items: [...] };
   * const result = await integrationService.send('square', 'orders/create', orderData);
   */
  send: async (system, endpoint, data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send/${system}/${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error sending data to ${system}/${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all registered webhooks and their recent events
   * 
   * @async
   * @function getWebhooks
   * @returns {Promise<Array>} List of registered webhooks with their events
   * @throws {Error} If the API request fails
   * @example
   * // Get all webhooks and their events
   * const webhooks = await integrationService.getWebhooks();
   */
  getWebhooks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/webhooks`);
      return response.data;
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  },

  /**
   * Registers a new webhook endpoint
   * 
   * @async
   * @function registerWebhook
   * @param {string} path - The path to register the webhook at (e.g., '/api/webhooks/orders')
   * @param {Object} options - Options for the webhook
   * @param {string} [options.description] - Description of the webhook's purpose
   * @param {Array<string>} [options.events] - List of events to subscribe to
   * @returns {Promise<Object>} Result of the registration including webhook ID
   * @throws {Error} If the webhook registration fails
   * @example
   * // Register a webhook for order events
   * const options = {
   *   description: 'Webhook for order notifications',
   *   events: ['order.created', 'order.updated']
   * };
   * await integrationService.registerWebhook('/api/webhooks/orders', options);
   */
  registerWebhook: async (path, options) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/webhooks/register`, { path, ...options });
      return response.data;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }
};

export default integrationService;
