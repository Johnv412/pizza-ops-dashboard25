import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for demonstration purposes
// In a real implementation, this would come from your API endpoints connecting to Manus, Roo, and Grok
const mockAIEmployeeData = {
  manus: {
    name: "Manus",
    role: "Lead Importer AI",
    status: "active",
    currentTask: "Importing pizza shops from LeadsImporter",
    progress: 75,
    lastUpdated: "2 minutes ago",
    recentActivity: [
      { timestamp: "14:29:50", action: "Imported shop: Mario's Pizza" },
      { timestamp: "14:28:45", action: "Imported shop: Slice of Heaven" },
      { timestamp: "14:27:30", action: "Imported shop: Pizza Paradise" },
      { timestamp: "14:26:15", action: "Imported shop: Crust & Co." },
      { timestamp: "14:25:00", action: "Started import process" }
    ]
  },
  roo: {
    name: "Roo",
    role: "Workflow Automation AI",
    status: "active",
    currentTask: "Syncing data to InstaWP",
    progress: 62,
    lastUpdated: "1 minute ago",
    recentActivity: [
      { timestamp: "14:30:05", action: "Syncing shop: Mario's Pizza" },
      { timestamp: "14:29:30", action: "Synced shop: Slice of Heaven" },
      { timestamp: "14:28:15", action: "Synced shop: Pizza Paradise" },
      { timestamp: "14:27:00", action: "Synced shop: Crust & Co." },
      { timestamp: "14:26:45", action: "Received import notification from Manus" }
    ],
    workflows: [
      { id: "wf-124", name: "Data Sync", status: "in_progress", completion: 62 },
      { id: "wf-125", name: "Outreach Automation", status: "queued", completion: 0 }
    ]
  },
  grok: {
    name: "Grok",
    role: "Content Creation AI",
    status: "active",
    currentTask: "Generating shop descriptions",
    progress: 40,
    lastUpdated: "3 minutes ago",
    recentActivity: [
      { timestamp: "14:29:55", action: "Generated description for Slice of Heaven" },
      { timestamp: "14:28:40", action: "Generated description for Pizza Paradise" },
      { timestamp: "14:27:25", action: "Generated description for Crust & Co." },
      { timestamp: "14:26:10", action: "Received content generation request" },
      { timestamp: "14:25:55", action: "Analyzing pizza shop data" }
    ],
    contentQueue: [
      { id: "content-45", type: "Shop Description", target: "Mario's Pizza", status: "in_progress" },
      { id: "content-46", type: "Shop Description", target: "Cheesy Bites", status: "queued" },
      { id: "content-47", type: "Shop Description", target: "Pizza Planet", status: "queued" }
    ]
  }
};

// Mock alerts data
const mockAlerts = [
  {
    id: "alert-1",
    source: "grok",
    priority: "high",
    message: "API rate limit reached for content generation",
    details: "Unable to generate content for remaining shops due to API limitations",
    timestamp: "14:15:30",
    status: "unresolved"
  },
  {
    id: "alert-2",
    source: "manus",
    priority: "medium",
    message: "Missing contact information for 3 pizza shops",
    details: "Unable to import complete data for: Luigi's Pizza, Dough Masters, Pizza Heaven",
    timestamp: "13:45:20",
    status: "unresolved"
  },
  {
    id: "alert-3",
    source: "roo",
    priority: "low",
    message: "Outreach emails scheduled",
    details: "15 outreach emails have been scheduled for delivery in the next hour",
    timestamp: "12:30:15",
    status: "resolved"
  }
];

// Performance data for the chart
const performanceData = [
  { name: '09:00', manus: 20, roo: 15, grok: 10 },
  { name: '10:00', manus: 35, roo: 28, grok: 22 },
  { name: '11:00', manus: 50, roo: 45, grok: 35 },
  { name: '12:00', manus: 65, roo: 59, grok: 48 },
  { name: '13:00', manus: 78, roo: 70, grok: 62 },
  { name: '14:00', manus: 90, roo: 82, grok: 75 }
];

const AIEmployeesMonitor = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('manus');
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  useEffect(() => {
    // Filter unresolved alerts
    const unresolved = mockAlerts.filter(alert => alert.status === 'unresolved');
    setActiveAlerts(unresolved);
    
    // In a real implementation, you would set up a webhook listener or polling mechanism here
    // to receive real-time updates from your AI employees
    
    // Example:
    // const websocket = new WebSocket('wss://your-api.com/ai-employees/updates');
    // websocket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Update state based on the received data
    // };
    // 
    // return () => {
    //   websocket.close();
    // };
  }, []);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'idle':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };
  
  const getEmployeeData = (employeeId) => {
    return mockAIEmployeeData[employeeId] || {};
  };
  
  const currentEmployee = getEmployeeData(selectedEmployee);
  
  const handleAlertResolve = (alertId) => {
    setActiveAlerts(activeAlerts.filter(alert => alert.id !== alertId));
    // In a real implementation, you would also send a request to your alert system
    // to mark the alert as resolved
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">AI Employees Monitor</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${selectedEmployee === 'manus' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setSelectedEmployee('manus')}
          >
            Manus
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${selectedEmployee === 'roo' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setSelectedEmployee('roo')}
          >
            Roo
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${selectedEmployee === 'grok' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            onClick={() => setSelectedEmployee('grok')}
          >
            Grok
          </button>
        </div>
      </div>
      
      {/* Performance Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">AI Employee Performance</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="manus" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="roo" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="grok" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`border-l-4 p-4 rounded-r-md ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">
                      {alert.source.charAt(0).toUpperCase() + alert.source.slice(1)}: {alert.message}
                    </h3>
                    <p className="text-sm mt-1">{alert.details}</p>
                    <p className="text-xs text-gray-500 mt-1">Reported at {alert.timestamp}</p>
                  </div>
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    onClick={() => handleAlertResolve(alert.id)}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected Employee Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">{currentEmployee.name} Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">Role:</span>
              <span className="ml-2 font-medium">{currentEmployee.role}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentEmployee.status)}`}>
                {currentEmployee.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Current Task:</span>
              <span className="ml-2">{currentEmployee.currentTask}</span>
            </div>
            <div>
              <span className="text-gray-500">Progress:</span>
              <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${currentEmployee.progress}%` }}
                ></div>
              </div>
              <span className="text-sm">{currentEmployee.progress}% Complete</span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2">{currentEmployee.lastUpdated}</span>
            </div>
          </div>
        </div>
        
        {/* Activity Log */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {currentEmployee.recentActivity?.map((activity, index) => (
              <div key={index} className="border-l-2 border-gray-300 pl-3 py-1">
                <div className="text-sm font-medium">{activity.action}</div>
                <div className="text-xs text-gray-500">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Task-Specific Information */}
        <div className="bg-white p-4 rounded-lg shadow">
          {selectedEmployee === 'roo' && (
            <>
              <h2 className="text-lg font-medium mb-4">Active Workflows</h2>
              <div className="space-y-4">
                {currentEmployee.workflows?.map(workflow => (
                  <div key={workflow.id} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{workflow.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${workflow.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {workflow.status === 'in_progress' ? 'In Progress' : 'Queued'}
                      </span>
                    </div>
                    {workflow.status === 'in_progress' && (
                      <div className="mt-2">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${workflow.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{workflow.completion}% Complete</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          
          {selectedEmployee === 'grok' && (
            <>
              <h2 className="text-lg font-medium mb-4">Content Queue</h2>
              <div className="space-y-3">
                {currentEmployee.contentQueue?.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.target}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status === 'in_progress' ? 'In Progress' : 'Queued'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{item.type}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {selectedEmployee === 'manus' && (
            <>
              <h2 className="text-lg font-medium mb-4">Import Statistics</h2>
              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Imported', value: 48 },
                      { name: 'Pending', value: 16 },
                      { name: 'Failed', value: 3 }
                    ]}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Pizza Shops:</span>
                  <span className="font-medium">67</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Import Rate:</span>
                  <span className="font-medium">12 shops/hour</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Completion:</span>
                  <span className="font-medium">1 hour 25 minutes</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Communication Log */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">AI Communication Log</h2>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:30:10</span>
              <span className="font-medium text-purple-600 w-16">Grok</span>
              <span>Starting content generation for Mario's Pizza</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:30:05</span>
              <span className="font-medium text-green-600 w-16">Roo</span>
              <span>Notifying Grok to generate content for Mario's Pizza</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:30:00</span>
              <span className="font-medium text-green-600 w-16">Roo</span>
              <span>Successfully synced Mario's Pizza to InstaWP</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:55</span>
              <span className="font-medium text-purple-600 w-16">Grok</span>
              <span>Completed content generation for Slice of Heaven</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:50</span>
              <span className="font-medium text-blue-600 w-16">Manus</span>
              <span>Imported Mario's Pizza from LeadsImporter</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:45</span>
              <span className="font-medium text-green-600 w-16">Roo</span>
              <span>Starting sync process for Mario's Pizza</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:40</span>
              <span className="font-medium text-blue-600 w-16">Manus</span>
              <span>Notifying Roo about new pizza shop: Mario's Pizza</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:30</span>
              <span className="font-medium text-green-600 w-16">Roo</span>
              <span>Synced Slice of Heaven to InstaWP</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:25</span>
              <span className="font-medium text-green-600 w-16">Roo</span>
              <span>Notifying Grok to generate content for Slice of Heaven</span>
            </div>
            <div className="flex">
              <span className="font-medium text-blue-600 w-16">14:29:00</span>
              <span className="font-medium text-blue-600 w-16">Manus</span>
              <span>Imported Slice of Heaven from LeadsImporter</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Control Panel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Manus Controls</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Start Import
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                Pause Import
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Stop Import
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Roo Controls</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Start Workflows
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                Pause Workflows
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Stop Workflows
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Grok Controls</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Generate Content
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                Pause Generation
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Stop Generation
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h3 className="font-medium mb-2">System Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">API Status</div>
              <div className="font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Operational
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Webhook Status</div>
              <div className="font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">n8n Status</div>
              <div className="font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Running
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmployeesMonitor;
