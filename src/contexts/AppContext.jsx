import { createContext, useState, useContext } from 'react';

/**
 * Application Context
 * 
 * Creates a React Context for global state management across the application.
 * This context provides shared state and functionality for:
 * - Global loading indicators
 * - Notification system
 * - Other application-wide state
 * 
 * @type {React.Context}
 */
const AppContext = createContext();

/**
 * Application Context Provider
 * 
 * Wraps the application with the AppContext.Provider to make global state
 * available to all child components. Manages shared state and provides
 * utility functions for manipulating that state.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export const AppProvider = ({ children }) => {
  /**
   * Global loading state
   * Used to show/hide the application-wide loading overlay
   * 
   * @type {[boolean, Function]}
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Notification state
   * Manages the visibility and content of global notifications
   * 
   * @type {[Object, Function]}
   * @property {boolean} open - Whether the notification is visible
   * @property {string} message - The notification message
   * @property {string} type - The notification type (info, success, warning, error)
   */
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info', // 'info', 'success', 'warning', 'error'
  });
  
  /**
   * Shows a notification with the specified message and type
   * Automatically hides the notification after 5 seconds
   * 
   * @function showNotification
   * @param {string} message - The notification message to display
   * @param {string} [type='info'] - The notification type (info, success, warning, error)
   */
  const showNotification = (message, type = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        open: false,
      }));
    }, 5000);
  };
  
  /**
   * Hides the currently displayed notification
   * 
   * @function hideNotification
   */
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  };
  
  /**
   * Context value object containing all shared state and functions
   * This is provided to all components that consume the context
   * 
   * @type {Object}
   */
  const contextValue = {
    // Loading state
    isLoading,
    setIsLoading,
    
    // Notifications
    notification,
    showNotification,
    hideNotification,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
      
      {/* Global notification component */}
      {notification.open && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span>{notification.message}</span>
            <button onClick={hideNotification} className="notification-close">
              &times;
            </button>
          </div>
        </div>
      )}
      
      {/* Global loading overlay */}
      {isLoading && (
        <div className="global-loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </AppContext.Provider>
  );
};

/**
 * Custom hook for using the app context
 * 
 * Provides a convenient way to access the app context in functional components
 * Throws an error if used outside of an AppProvider
 * 
 * @function useAppContext
 * @returns {Object} The app context value
 * @throws {Error} If used outside of an AppProvider
 * @example
 * // In a component:
 * const { showNotification, isLoading, setIsLoading } = useAppContext();
 * 
 * // Show a success notification
 * showNotification('Operation successful!', 'success');
 * 
 * // Show/hide loading overlay
 * setIsLoading(true);
 * // ... async operation ...
 * setIsLoading(false);
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
