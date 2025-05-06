import { useState, useEffect, useCallback } from 'react';
import integrationService from '../services/integrationService';

/**
 * Webhook Events Component
 * 
 * This component displays a list of recent webhook events received by the system,
 * with filtering capabilities and automatic polling for updates.
 * 
 * Features:
 * - Displays webhook events with source, timestamp, path, method, and payload
 * - Filters events by source system
 * - Auto-refreshes data every 15 seconds
 * - Handles loading and error states
 * 
 * @component
 */
const WebhookEventsComponent = () => {
  /**
   * Component state
   * - webhookEvents: Array of webhook events received from the backend
   * - loading: Loading state during data fetching
   * - error: Error message if data fetching fails
   * - filterSource: Currently selected source filter
   * - sources: List of unique event sources for the filter dropdown
   */
  const [webhookEvents, setWebhookEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSource, setFilterSource] = useState('all');
  const [sources, setSources] = useState([]);

  /**
   * Fetches webhook events from the backend
   * Extracts unique sources for the filter dropdown
   * Updates component state with the results
   * 
   * @async
   * @function fetchWebhookEvents
   * @memberof WebhookEventsComponent
   */
  const fetchWebhookEvents = useCallback(async () => {
    try {
      const webhooks = await integrationService.getWebhooks();
      setWebhookEvents(webhooks);
      
      // Extract unique sources for filter dropdown
      const uniqueSources = [...new Set(webhooks.map(webhook => webhook.source))];
      setSources(uniqueSources);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching webhook events:', err);
      setError('Failed to load webhook events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Effect hook to fetch initial data and set up polling
   * Polls for new webhook events every 15 seconds
   * Cleans up interval on component unmount
   */
  useEffect(() => {
    // Initial data fetch
    fetchWebhookEvents();
    
    // Set up polling every 15 seconds
    const pollingInterval = setInterval(() => {
      fetchWebhookEvents();
    }, 15000);
    
    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval);
  }, [fetchWebhookEvents]);

  /**
   * Filters webhook events based on selected source
   * Returns all events if 'all' is selected, otherwise filters by source
   * 
   * @type {Array}
   */
  const filteredEvents = webhookEvents.filter(event => 
    filterSource === 'all' || event.source === filterSource
  );

  /**
   * Formats a timestamp into a human-readable date/time string
   * 
   * @function formatTimestamp
   * @param {string|number} timestamp - The timestamp to format
   * @returns {string} Formatted date/time string
   */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Render loading spinner while fetching data
  if (loading) {
    return <div className="loading-spinner">Loading webhook events...</div>;
  }

  // Render error message if data fetching failed
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="webhook-events-container">
      {/* Header with title and filter dropdown */}
      <div className="webhook-header">
        <h2>Recent Webhook Events</h2>
        <div className="filter-container">
          <label htmlFor="source-filter">Filter by source:</label>
          <select 
            id="source-filter"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="source-filter-select"
          >
            <option value="all">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event list or empty state message */}
      {filteredEvents.length === 0 ? (
        <div className="no-events-message">
          No webhook events found.
        </div>
      ) : (
        <div className="webhook-events-list">
          {filteredEvents.map((event, index) => (
            <div key={index} className="webhook-event-card">
              <div className="event-header">
                <span className="event-source">{event.source}</span>
                <span className="event-timestamp">{formatTimestamp(event.timestamp)}</span>
              </div>
              <div className="event-path">Path: {event.path}</div>
              <div className="event-method">Method: {event.method}</div>
              <div className="event-data">
                <h4>Payload:</h4>
                <pre>{JSON.stringify(event.payload, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebhookEventsComponent;
