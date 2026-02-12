import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const modules = [
  {
    title: 'Module 1: ROS 2',
    emoji: '🤖',
    weeks: 'Weeks 1-5',
    description: 'Master the Robot Operating System 2 — the middleware powering modern robots. Learn nodes, topics, services, Python packages, and URDF.',
    link: '/docs/module-1-ros2/intro-physical-ai',
  },
  {
    title: 'Module 2: Simulation',
    emoji: '🌐',
    weeks: 'Weeks 6-7',
    description: 'Build digital twins with Gazebo and Unity. Simulate physics, gravity, collisions, and sensors like LiDAR, depth cameras, and IMUs.',
    link: '/docs/module-2-simulation/gazebo-setup',
  },
  {
    title: 'Module 3: NVIDIA Isaac',
    emoji: '🧠',
    weeks: 'Weeks 8-10',
    description: 'Harness NVIDIA Isaac for photorealistic simulation, hardware-accelerated perception, VSLAM, and autonomous navigation.',
    link: '/docs/module-3-nvidia-isaac/isaac-sim-intro',
  },
  {
    title: 'Module 4: VLA Models',
    emoji: '🗣️',
    weeks: 'Weeks 11-13',
    description: 'Connect LLMs to robot actions. Build voice-to-action pipelines, cognitive planning, and a conversational humanoid capstone.',
    link: '/docs/module-4-vla/voice-to-action',
  },
];

function ModuleCard({title, emoji, weeks, description, link}) {
  return (
    <div className={clsx('col col--3')}>
      <div className={styles.moduleCard}>
        <div className={styles.moduleEmoji}>{emoji}</div>
        <Heading as="h3">{title}</Heading>
        <p className={styles.moduleWeeks}>{weeks}</p>
        <p>{description}</p>
        <Link className="button button--primary button--sm" to={link}>
          Explore Module
        </Link>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          A comprehensive textbook for learning to build AI systems that operate
          in the physical world — from ROS 2 fundamentals to autonomous humanoid robots.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Learning
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Physical AI & Humanoid Robotics Textbook"
      description="A comprehensive course covering ROS 2, Gazebo, NVIDIA Isaac, and Vision-Language-Action models for humanoid robotics.">
      <HomepageHeader />
      <main>
        <section className={styles.modules}>
          <div className="container">
            <div className="row">
              {modules.map((props, idx) => (
                <ModuleCard key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
