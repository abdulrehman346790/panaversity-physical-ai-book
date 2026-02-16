import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';

/**
 * ContentVariant - Conditional content renderer for personalized variants
 *
 * Renders content only if:
 * 1. Personalization is enabled
 * 2. User profile matches the variant criteria (level, language, hardware)
 *
 * Props:
 *   type: "explanation" | "code_example" | "exercise" - variant type
 *   level: "beginner" | "intermediate" | "advanced" - for explanations
 *   language: "python" | "cpp" | "ros2" - for code examples
 *   hardware: "sensor" | "robot" | "mixed" - for exercises
 *   children: React.ReactNode - the variant content to render
 *
 * Example:
 *   <ContentVariant type="explanation" level="beginner">
 *     ROS 2 is a middleware...
 *   </ContentVariant>
 *
 *   <ContentVariant type="code_example" language="python">
 *     import rclpy
 *     ...
 *   </ContentVariant>
 */
export function ContentVariant({ type, level, language, hardware, children }) {
  const { userProfile, personalizationEnabled, personalizationAvailable } = usePersonalization();

  // If personalization disabled or unavailable, render nothing (show default content)
  if (!personalizationEnabled || !personalizationAvailable || !userProfile) {
    return null;
  }

  // Determine if this variant matches the user's profile (T016)
  let matches = false;

  if (type === 'explanation' && level) {
    // For explanations, match by experience level
    // Infer which field to check based on common patterns
    // This is a simplified version - in production, this would be more sophisticated
    const relevantFields = ['ros2_experience', 'python_experience', 'cpp_experience'];
    matches = relevantFields.some((field) => userProfile[field] === level);
  } else if (type === 'code_example' && language) {
    // For code examples, match by language experience
    const languageField = {
      python: 'python_experience',
      cpp: 'cpp_experience',
      ros2: 'ros2_experience',
    }[language];

    if (languageField) {
      matches = userProfile[languageField] === mapLevelToExperience(level);
    }
  } else if (type === 'exercise' && hardware) {
    // For exercises, match by hardware background
    const hardwareField = {
      sensor: 'sensor_experience',
      robot: 'robot_hardware_experience',
    }[hardware];

    if (hardwareField) {
      matches = userProfile[hardwareField] === mapLevelToExperience(level);
    }
  }

  // T015, T017: Only render if variant matches user profile
  return matches ? <>{children}</> : null;
}

/**
 * Helper: Map hardware/exercise focus level to experience field value
 */
function mapLevelToExperience(level) {
  const mapping = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced',
    sensor: 'beginner',
    robot: 'intermediate',
    mixed: 'intermediate',
  };
  return mapping[level] || level;
}
