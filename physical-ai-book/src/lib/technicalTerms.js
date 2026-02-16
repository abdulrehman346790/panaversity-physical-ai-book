/**
 * Technical Terms Whitelist
 * Terms that should never be translated - libraries, functions, code concepts
 * These terms remain in English even when chapter is displayed in Urdu
 */

export const TECHNICAL_WHITELIST = [
  // ROS 2 Core
  { term: 'ROS 2', category: 'library', context: 'Robot Operating System 2', case_sensitive: true },
  { term: 'ROS', category: 'library', context: 'Robot Operating System', case_sensitive: true },
  { term: 'rclpy', category: 'library', context: 'Python client library for ROS 2', case_sensitive: true },
  { term: 'rclcpp', category: 'library', context: 'C++ client library for ROS 2', case_sensitive: true },
  { term: 'rcl', category: 'library', context: 'ROS 2 C library', case_sensitive: true },

  // Core Concepts
  { term: 'middleware', category: 'concept', context: 'Software layer connecting components', case_sensitive: false },
  { term: 'node', category: 'concept', context: 'ROS 2 executable entity', case_sensitive: false },
  { term: 'topic', category: 'concept', context: 'Named bus for exchanging messages', case_sensitive: false },
  { term: 'service', category: 'concept', context: 'Request-reply communication pattern', case_sensitive: false },
  { term: 'action', category: 'concept', context: 'Long-running task communication', case_sensitive: false },
  { term: 'parameter', category: 'concept', context: 'Configuration value for ROS entity', case_sensitive: false },
  { term: 'executor', category: 'concept', context: 'Executes callbacks for subscription/timers', case_sensitive: false },
  { term: 'DDS', category: 'concept', context: 'Data Distribution Service', case_sensitive: true },

  // Communication Patterns
  { term: 'publish', category: 'function', context: 'Send message to topic', case_sensitive: false },
  { term: 'subscribe', category: 'function', context: 'Listen to messages on topic', case_sensitive: false },
  { term: 'client', category: 'concept', context: 'Sends service request', case_sensitive: false },
  { term: 'server', category: 'concept', context: 'Responds to service request', case_sensitive: false },
  { term: 'message', category: 'concept', context: 'Data unit in ROS communication', case_sensitive: false },

  // Common ROS 2 Functions
  { term: 'init', category: 'function', context: 'Initialize ROS 2', case_sensitive: false },
  { term: 'create_node', category: 'function', context: 'Create ROS 2 node', case_sensitive: false },
  { term: 'create_publisher', category: 'function', context: 'Create message publisher', case_sensitive: false },
  { term: 'create_subscription', category: 'function', context: 'Create message subscription', case_sensitive: false },
  { term: 'spin', category: 'function', context: 'Run executor loop', case_sensitive: false },
  { term: 'shutdown', category: 'function', context: 'Shutdown ROS 2', case_sensitive: false },

  // Other Robotics Tools
  { term: 'Gazebo', category: 'library', context: 'Robotics simulator', case_sensitive: true },
  { term: 'URDF', category: 'api', context: 'Unified Robot Description Format', case_sensitive: true },
  { term: 'TF', category: 'library', context: 'ROS 2 Transform library', case_sensitive: true },
  { term: 'tf2', category: 'library', context: 'Transform library for ROS 2', case_sensitive: true },
  { term: 'YAML', category: 'api', context: 'Configuration file format', case_sensitive: true },
  { term: 'XML', category: 'api', context: 'Markup language', case_sensitive: true },
  { term: 'JSON', category: 'api', context: 'Data interchange format', case_sensitive: true },

  // Hardware/Sensors
  { term: 'sensor', category: 'concept', context: 'Device that measures environment', case_sensitive: false },
  { term: 'camera', category: 'concept', context: 'Image capturing device', case_sensitive: false },
  { term: 'lidar', category: 'concept', context: 'Light Detection and Ranging', case_sensitive: false },
  { term: 'accelerometer', category: 'concept', context: 'Measures acceleration', case_sensitive: false },
  { term: 'gyroscope', category: 'concept', context: 'Measures rotation rate', case_sensitive: false },
  { term: 'motor', category: 'concept', context: 'Actuator for movement', case_sensitive: false },
  { term: 'actuator', category: 'concept', context: 'Device that produces movement', case_sensitive: false },

  // Programming Concepts
  { term: 'Python', category: 'library', context: 'Programming language', case_sensitive: true },
  { term: 'C++', category: 'library', context: 'Programming language', case_sensitive: true },
  { term: 'callback', category: 'concept', context: 'Function executed in response to event', case_sensitive: false },
  { term: 'async', category: 'concept', context: 'Asynchronous execution', case_sensitive: false },
  { term: 'API', category: 'api', context: 'Application Programming Interface', case_sensitive: true },
  { term: 'interface', category: 'concept', context: 'Contract for interaction', case_sensitive: false },
  { term: 'class', category: 'concept', context: 'Object-oriented construct', case_sensitive: false },
  { term: 'function', category: 'concept', context: 'Reusable code block', case_sensitive: false },
  { term: 'variable', category: 'concept', context: 'Named storage for data', case_sensitive: false },
  { term: 'loop', category: 'concept', context: 'Repeated execution', case_sensitive: false },
  { term: 'conditional', category: 'concept', context: 'If-then-else logic', case_sensitive: false },

  // NVIDIA Isaac & Vision
  { term: 'Isaac', category: 'library', context: 'NVIDIA robotics simulation platform', case_sensitive: true },
  { term: 'CUDA', category: 'library', context: 'NVIDIA GPU computing', case_sensitive: true },
  { term: 'GPU', category: 'concept', context: 'Graphics Processing Unit', case_sensitive: true },
  { term: 'tensor', category: 'concept', context: 'Multi-dimensional array', case_sensitive: false },

  // VLA (Vision Language Models)
  { term: 'VLA', category: 'api', context: 'Vision Language Action model', case_sensitive: true },
  { term: 'LLM', category: 'api', context: 'Large Language Model', case_sensitive: true },
  { term: 'embedding', category: 'concept', context: 'Vector representation of data', case_sensitive: false },
  { term: 'inference', category: 'concept', context: 'Running model prediction', case_sensitive: false },

  // Common Commands
  { term: 'import', category: 'function', context: 'Load module', case_sensitive: false },
  { term: 'from', category: 'function', context: 'Import from module', case_sensitive: false },
  { term: 'colcon', category: 'library', context: 'ROS 2 build tool', case_sensitive: false },
  { term: 'pip', category: 'library', context: 'Python package manager', case_sensitive: false },
  { term: 'apt', category: 'library', context: 'Linux package manager', case_sensitive: false },
];

/**
 * Check if a term is in the whitelist
 * @param {string} word - Word to check
 * @returns {boolean} True if word is whitelisted (should not be translated)
 */
export function isWhitelistedTerm(word) {
  return TECHNICAL_WHITELIST.some((item) => {
    if (item.case_sensitive) {
      return word === item.term;
    }
    return word.toLowerCase() === item.term.toLowerCase();
  });
}

/**
 * Get whitelist entry for a term
 * @param {string} word - Word to look up
 * @returns {Object|null} Whitelist entry or null
 */
export function getWhitelistEntry(word) {
  return (
    TECHNICAL_WHITELIST.find((item) => {
      if (item.case_sensitive) {
        return word === item.term;
      }
      return word.toLowerCase() === item.term.toLowerCase();
    }) || null
  );
}
