#!/bin/bash

# Create placeholder translation files for chapters 3-16
chapters=(
  "03-rclcpp-cpp-client-library|rclcpp کی بنیادات"
  "04-nodes-publishers-subscribers|نوڈز، Publishers اور Subscribers"
  "05-services-and-clients|Services اور Clients"
  "06-ros2-tools-and-utilities|ROS 2 Tools اور Utilities"
  "07-gazebo-simulation-setup|Gazebo سمولیشن سیٹ اپ"
  "08-creating-robot-descriptions|روبوٹ کی تفصیلات بنانا"
  "09-simulation-exercises|سمولیشن مشقیں"
  "10-isaac-sim-introduction|NVIDIA Isaac Sim کا تعارف"
  "11-physics-and-rendering|فزکس اور رینڈرنگ"
  "12-synthetic-data-generation|مصنوعی ڈیٹا تیاری"
  "13-vision-language-action-models|Vision Language Action ماڈلز"
  "14-vla-inference|VLA Inference"
  "15-robotic-manipulation|Robotic Manipulation"
  "16-closing-remarks|اختتامی نکات"
)

for chapter in "${chapters[@]}"; do
  IFS='|' read -r slug title <<< "$chapter"
  cat > "${slug}.json" << EOFJ
{
  "chapter_id": "${slug}",
  "language": "urdu",
  "title": "${title}",
  "content": "<h2>${title}</h2><p>یہ فصل ${title} کے بارے میں ہے۔</p><p>اگلے حصوں میں تفصیلات دی جائیں گی۔</p>",
  "translation_status": "pending",
  "last_updated": "2026-02-16T12:00:00Z",
  "translator": "Urdu Localization Team (Placeholder)",
  "whitelist_applied": false
}
EOFJ
done

ls -la | grep ".json"
