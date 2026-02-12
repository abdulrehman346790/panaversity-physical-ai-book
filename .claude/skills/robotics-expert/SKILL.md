---
name: robotics-expert
description: Deep domain knowledge about Physical AI, ROS 2, Gazebo, NVIDIA Isaac, VLA models, and humanoid robotics. Use when generating technically accurate robotics content, answering domain questions, or validating technical accuracy of chapters.
user-invocable: false
---

# Physical AI & Humanoid Robotics Domain Expert

You have deep expertise in all topics covered by the Physical AI & Humanoid Robotics course. Use this knowledge to ensure technical accuracy in all content.

## Module 1: ROS 2 (Robot Operating System 2) Knowledge

### Core Concepts
- **DDS (Data Distribution Service)**: ROS 2's middleware layer. Supports QoS policies (reliability, durability, deadline, liveliness)
- **Nodes**: Fundamental execution units. Each node is a single-purpose process
- **Topics**: Named buses for pub/sub communication. Messages are typed (std_msgs, sensor_msgs, geometry_msgs)
- **Services**: Request/response pattern for synchronous calls (srv files)
- **Actions**: Long-running tasks with feedback (goal, result, feedback)
- **Parameters**: Node configuration at runtime via YAML or CLI
- **Launch files**: Python-based orchestration of multiple nodes
- **Lifecycle nodes**: Managed nodes with state transitions (unconfigured → inactive → active → finalized)

### rclpy (Python Client Library)
- `rclpy.init()` / `rclpy.shutdown()` lifecycle
- `Node` class: `create_publisher()`, `create_subscription()`, `create_service()`, `create_client()`
- `spin()`, `spin_once()`, `spin_until_future_complete()`
- Executors: `SingleThreadedExecutor`, `MultiThreadedExecutor`
- Callback groups: `MutuallyExclusiveCallbackGroup`, `ReentrantCallbackGroup`

### URDF (Unified Robot Description Format)
- XML-based robot model description
- Elements: `<robot>`, `<link>`, `<joint>`, `<visual>`, `<collision>`, `<inertial>`
- Joint types: revolute, continuous, prismatic, fixed, floating, planar
- Xacro macros for parameterized URDF
- tf2 transform tree from joint hierarchy

### Key Packages
- `ros2 topic`, `ros2 node`, `ros2 service`, `ros2 param`, `ros2 action` CLI tools
- `colcon build` system
- `ament_cmake` and `ament_python` build types
- `ros2_control` for hardware abstraction
- `ros2 bag` for recording/playback

## Module 2: Simulation Knowledge

### Gazebo (Ignition/Gz)
- SDF (Simulation Description Format) vs URDF
- Physics engines: ODE, Bullet, DART, Simbody
- Plugin system: world, model, sensor, visual plugins
- `gz sim` CLI and GUI
- Sensor plugins: camera, depth camera, lidar, IMU, contact sensor, force-torque
- ros_gz_bridge for ROS 2 ↔ Gazebo communication
- World files: gravity, physics step size, ambient conditions

### Unity Robotics
- Unity Robotics Hub: URDF Importer
- ROS-TCP-Connector and ROS-TCP-Endpoint
- ArticulationBody for physics-based joint simulation
- ML-Agents for reinforcement learning integration
- High-fidelity rendering for digital twins

### Sensor Simulation
- **LiDAR**: Point cloud generation, PCL (Point Cloud Library), scan matching
- **Depth Cameras**: RGB-D data, depth maps, point cloud conversion
- **IMU**: Accelerometer + gyroscope fusion, complementary/Kalman filters
- **Force/Torque sensors**: Contact detection, grasp force measurement

## Module 3: NVIDIA Isaac Platform Knowledge

### Isaac Sim
- Built on NVIDIA Omniverse platform
- USD (Universal Scene Description) for scene representation
- PhysX 5 for physics simulation
- RTX ray tracing for photorealistic rendering
- Synthetic Data Generation (SDG): domain randomization, annotation
- Replicator for dataset generation
- OmniGraph for visual programming
- Extension system for custom functionality

### Isaac ROS
- Hardware-accelerated ROS 2 packages for Jetson
- NITROS (NVIDIA Isaac Transport for ROS): zero-copy GPU-accelerated transport
- Key packages:
  - `isaac_ros_visual_slam`: cuVSLAM (GPU-accelerated VSLAM)
  - `isaac_ros_apriltag`: GPU-accelerated fiducial detection
  - `isaac_ros_dnn_inference`: TensorRT-based inference
  - `isaac_ros_object_detection`: YOLO/SSD object detection
  - `isaac_ros_depth_segmentation`: Depth-based segmentation

### Nav2 (Navigation 2)
- Behavior Trees for navigation task orchestration
- Costmap 2D: static layer, obstacle layer, inflation layer
- Planners: NavFn (Dijkstra/A*), Theta*, SmacPlanner (Hybrid-A*, State Lattice)
- Controllers: DWB (Dynamic Window Approach), RPP (Regulated Pure Pursuit), MPPI
- Recovery behaviors: spin, backup, wait
- Waypoint following and GPS navigation
- Bipedal adaptation: footstep planning, stability-aware path planning

### Sim-to-Real Transfer
- Domain randomization: textures, lighting, physics parameters
- Domain adaptation: feature alignment, progressive nets
- System identification: matching sim physics to real-world
- Curriculum learning: progressive difficulty in simulation

## Module 4: VLA (Vision-Language-Action) Knowledge

### Voice-to-Action Pipeline
- **OpenAI Whisper**: Speech-to-text, multilingual, robust to noise
- Audio capture: PyAudio, sounddevice
- ROS 2 audio pipeline: audio_common package
- Wake word detection: Porcupine, Snowboy alternatives

### LLM-to-ROS Action Translation
- Natural language → task decomposition
- Task planning: PDDL (Planning Domain Definition Language)
- Behavior tree generation from LLM output
- Action primitive library: pick, place, navigate, open, close, push, pull
- Safety constraints: workspace limits, force limits, collision avoidance
- Grounding: mapping language to physical objects via scene understanding

### Conversational Robotics
- Multi-modal interaction: speech + gesture + gaze
- Dialogue management: state tracking, intent recognition
- Social cues: proxemics, turn-taking, non-verbal communication
- GPT integration: function calling for robot actions
- Context maintenance across multi-turn conversations

### VLA Models
- RT-2 (Robotics Transformer 2): vision-language-action model
- SayCan: grounding LLM plans in robot capabilities
- PaLM-E: embodied multimodal language model
- CLIP for open-vocabulary object recognition
- Affordance prediction from visual input

## Hardware Knowledge

### NVIDIA Jetson Platform
- Jetson Orin Nano: 40 TOPS, 8GB RAM, $249
- Jetson Orin NX: 100 TOPS, 16GB RAM
- JetPack SDK: L4T, CUDA, cuDNN, TensorRT
- Power modes and thermal management
- GPIO, I2C, SPI, UART interfaces

### Sensors
- Intel RealSense D435i: RGB + Depth + IMU, 848x480@90fps depth
- LiDAR options: RPLiDAR, Velodyne VLP-16
- BNO055 IMU: 9-DOF, sensor fusion onboard

### Robot Platforms
- Unitree Go2: quadruped, ROS 2 SDK, ~$1800-3000
- Unitree G1: humanoid, 23 DOF, ~$16k
- Unitree H1: full-size humanoid, ~$90k+
- Hiwonder TonyPi Pro: small humanoid, ~$600, RPi-based

## Key Mathematical Concepts

- **Kinematics**: DH parameters, forward/inverse kinematics
- **Dynamics**: Newton-Euler, Lagrangian mechanics
- **Control**: PID, impedance control, whole-body control
- **SLAM**: Extended Kalman Filter, particle filter, graph-based optimization
- **Path Planning**: A*, RRT, RRT*, PRM
- **Bipedal Locomotion**: ZMP (Zero Moment Point), capture point, DCM (Divergent Component of Motion)
