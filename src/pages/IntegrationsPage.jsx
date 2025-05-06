import { useState, useEffect } from 'react';
import integrationService from '../services/integrationService';
import WebhookEventsComponent from '../components/WebhookEventsComponent';

/**
 * Integrations Page Component
 * 
 * This page provides a comprehensive interface for managing backend integrations,
 * including connecting to external systems, managing active connections, and
 * registering webhooks for event notifications.
 * 
 * The component is divided into three main sections:
 * 1. Active Connections - Displays currently connected systems with status information
 * 2. Connect to System - Form for establishing new connections with external systems
 * 3. Register Webhook - Form for registering new webhook endpoints
 * 
 * @component
 */
const IntegrationsPage = () => {
  // =========================================================================
  // State Management
  // =========================================================================
  
  /**
   * State for adapters and connections
   * - adapters: List of available integration adapters (Square, SendGrid, etc.)
   * - connections: List of active connections to external systems
   * - loading: Loading state for data fetching operations
   * - error: Error message if data fetching fails
   */
  const [adapters, setAdapters] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * State for connection form
   * - selectedAdapter: Currently selected adapter ID
   * - credentials: Form values for authentication credentials
   * - formError/formSuccess: Form submission status messages
   * - isSubmitting: Loading state during form submission
   */
  const [selectedAdapter, setSelectedAdapter] = useState('');
  const [credentials, setCredentials] = useState({});
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * State for webhook registration
   * - webhookPath: Path for the new webhook endpoint
   * - webhookOptions: Configuration options for the webhook
   * - webhookError/webhookSuccess: Form submission status messages
   * - isRegisteringWebhook: Loading state during webhook registration
   */
  const [webhookPath, setWebhookPath] = useState('');
  const [webhookOptions, setWebhookOptions] = useState({
    description: '',
    events: []
  });
  const [webhookError, setWebhookError] = useState(null);
  const [webhookSuccess, setWebhookSuccess] = useState(null);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);

  // =========================================================================
  // Data Fetching
  // =========================================================================
  
  /**
   * Fetch adapters and connections on component mount
   * Uses Promise.all to fetch both datasets in parallel for efficiency
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [adaptersData, connectionsData] = await Promise.all([
          integrationService.getAdapters(),
          integrationService.getConnections()
        ]);
        
        setAdapters(adaptersData);
        setConnections(connectionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching integration data:', err);
        setError('Failed to load integration data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // =========================================================================
  // Event Handlers - Connection Form
  // =========================================================================
  
  /**
   * Handles adapter selection change
   * Resets the credentials form based on the selected adapter's requirements
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event
   */
  const handleAdapterChange = (e) => {
    const selectedAdapterId = e.target.value;
    setSelectedAdapter(selectedAdapterId);
    
    // Reset credentials form based on selected adapter
    const adapter = adapters.find(a => a.id === selectedAdapterId);
    if (adapter) {
      const initialCredentials = {};
      adapter.requiredCredentials.forEach(field => {
        initialCredentials[field.name] = '';
      });
      setCredentials(initialCredentials);
    } else {
      setCredentials({});
    }
    
    // Clear previous form messages
    setFormError(null);
    setFormSuccess(null);
  };
  
  /**
   * Handles credential input changes
   * Updates the credentials state with the new value
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Handles connection form submission
   * Validates form, submits credentials to the backend, and updates UI state
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!selectedAdapter) {
      setFormError('Please select an adapter');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const result = await integrationService.connect(selectedAdapter, credentials);
      
      // Refresh connections list
      const updatedConnections = await integrationService.getConnections();
      setConnections(updatedConnections);
      
      setFormSuccess(`Successfully connected to ${selectedAdapter}`);
      
      // Reset form
      setSelectedAdapter('');
      setCredentials({});
    } catch (err) {
      console.error('Connection error:', err);
      setFormError(err.response?.data?.message || 'Failed to connect. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handles disconnection from an external system
   * Confirms with user, submits request to backend, and updates UI state
   * 
   * @param {string} connectionId - ID of the connection to disconnect
   */
  const handleDisconnect = async (connectionId) => {
    if (!window.confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }
    
    try {
      setLoading(true);
      await integrationService.disconnect(connectionId);
      
      // Refresh connections list
      const updatedConnections = await integrationService.getConnections();
      setConnections(updatedConnections);
      
      setFormSuccess('Successfully disconnected');
    } catch (err) {
      console.error('Disconnection error:', err);
      setFormError(err.response?.data?.message || 'Failed to disconnect. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // =========================================================================
  // Event Handlers - Webhook Form
  // =========================================================================
  
  /**
   * Handles webhook option changes
   * Updates the webhookOptions state with the new value
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleWebhookOptionChange = (e) => {
    const { name, value } = e.target;
    setWebhookOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  /**
   * Handles webhook events selection
   * Updates the events array in webhookOptions state
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event
   */
  const handleWebhookEventsChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setWebhookOptions(prev => ({
      ...prev,
      events: options
    }));
  };
  
  /**
   * Handles webhook registration form submission
   * Validates form, submits to backend, and updates UI state
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleRegisterWebhook = async (e) => {
    e.preventDefault();
    
    if (!webhookPath) {
      setWebhookError('Please enter a webhook path');
      return;
    }
    
    try {
      setIsRegisteringWebhook(true);
      setWebhookError(null);
      
      await integrationService.registerWebhook(webhookPath, webhookOptions);
      
      setWebhookSuccess(`Successfully registered webhook at ${webhookPath}`);
      
      // Reset form
      setWebhookPath('');
      setWebhookOptions({
        description: '',
        events: []
      });
    } catch (err) {
      console.error('Webhook registration error:', err);
      setWebhookError(err.response?.data?.message || 'Failed to register webhook. Please try again.');
    } finally {
      setIsRegisteringWebhook(false);
    }
  };
  
  // =========================================================================
  // Side Effects
  // =========================================================================
  
  /**
   * Auto-hide success messages after 5 seconds
   * Uses separate useEffect hooks for each message type to avoid dependencies issues
   */
  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess]);
  
  useEffect(() => {
    if (webhookSuccess) {
      const timer = setTimeout(() => {
        setWebhookSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [webhookSuccess]);
  
  // =========================================================================
  // Render Loading State
  // =========================================================================
  
  if (loading && !connections.length && !adapters.length) {
    return <div className="loading-spinner">Loading integration data...</div>;
  }

  // =========================================================================
  // Component Render
  // =========================================================================
  
  return (
    <div className="integrations-page">
      <h1>Backend Integrations</h1>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="integrations-container">
        {/* Active Connections Section */}
        <div className="connections-section">
          <h2>Active Connections</h2>
          
          {connections.length === 0 ? (
            <div className="no-connections-message">
              No active connections. Connect to a system below.
            </div>
          ) : (
            <div className="connections-list">
              {connections.map(connection => (
                <div key={connection.id} className="connection-card">
                  <div className="connection-header">
                    <h3>{connection.name}</h3>
                    <span className={`connection-status ${connection.status}`}>
                      {connection.status}
                    </span>
                  </div>
                  <div className="connection-details">
                    <p><strong>System:</strong> {connection.system}</p>
                    <p><strong>Connected:</strong> {new Date(connection.connectedAt).toLocaleString()}</p>
                    {connection.lastSync && (
                      <p><strong>Last Sync:</strong> {new Date(connection.lastSync).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="connection-actions">
                    <button 
                      className="disconnect-button"
                      onClick={() => handleDisconnect(connection.id)}
                      disabled={loading}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Connect to System Section */}
        <div className="connect-section">
          <h2>Connect to System</h2>
          
          {formSuccess && (
            <div className="success-message">{formSuccess}</div>
          )}
          
          {formError && (
            <div className="error-message">{formError}</div>
          )}
          
          <form onSubmit={handleConnect} className="connect-form">
            <div className="form-group">
              <label htmlFor="adapter-select">Select System:</label>
              <select
                id="adapter-select"
                value={selectedAdapter}
                onChange={handleAdapterChange}
                disabled={isSubmitting}
                required
              >
                <option value="">-- Select a system --</option>
                {adapters.map(adapter => (
                  <option key={adapter.id} value={adapter.id}>
                    {adapter.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedAdapter && (
              <>
                <h3>Credentials</h3>
                {adapters
                  .find(a => a.id === selectedAdapter)?.requiredCredentials
                  .map(field => (
                    <div key={field.name} className="form-group">
                      <label htmlFor={field.name}>{field.label}:</label>
                      <input
                        type={field.type === 'password' ? 'password' : 'text'}
                        id={field.name}
                        name={field.name}
                        value={credentials[field.name] || ''}
                        onChange={handleCredentialChange}
                        placeholder={field.placeholder || ''}
                        disabled={isSubmitting}
                        required={field.required}
                      />
                      {field.description && (
                        <div className="field-description">{field.description}</div>
                      )}
                    </div>
                  ))
                }
              </>
            )}
            
            <button 
              type="submit" 
              className="connect-button"
              disabled={!selectedAdapter || isSubmitting}
            >
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>
          </form>
        </div>
        
        {/* Register Webhook Section */}
        <div className="webhook-section">
          <h2>Register Webhook</h2>
          
          {webhookSuccess && (
            <div className="success-message">{webhookSuccess}</div>
          )}
          
          {webhookError && (
            <div className="error-message">{webhookError}</div>
          )}
          
          <form onSubmit={handleRegisterWebhook} className="webhook-form">
            <div className="form-group">
              <label htmlFor="webhook-path">Webhook Path:</label>
              <input
                type="text"
                id="webhook-path"
                value={webhookPath}
                onChange={(e) => setWebhookPath(e.target.value)}
                placeholder="/api/webhooks/my-endpoint"
                disabled={isRegisteringWebhook}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="webhook-description">Description:</label>
              <input
                type="text"
                id="webhook-description"
                name="description"
                value={webhookOptions.description}
                onChange={handleWebhookOptionChange}
                placeholder="Webhook for order notifications"
                disabled={isRegisteringWebhook}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="webhook-events">Events (hold Ctrl to select multiple):</label>
              <select
                id="webhook-events"
                multiple
                value={webhookOptions.events}
                onChange={handleWebhookEventsChange}
                disabled={isRegisteringWebhook}
                className="webhook-events-select"
              >
                <option value="order.created">Order Created</option>
                <option value="order.updated">Order Updated</option>
                <option value="order.fulfilled">Order Fulfilled</option>
                <option value="payment.received">Payment Received</option>
                <option value="inventory.updated">Inventory Updated</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="register-webhook-button"
              disabled={!webhookPath || isRegisteringWebhook}
            >
              {isRegisteringWebhook ? 'Registering...' : 'Register Webhook'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Webhook Events Section */}
      <div className="webhook-events-section">
        <WebhookEventsComponent />
      </div>
    </div>
  );
};

export default IntegrationsPage;
