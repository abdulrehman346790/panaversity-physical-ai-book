import React from 'react';
import styles from './styles.module.css';
import RobotArm from '../RobotArm';
import HumanoidCharacter from '../HumanoidCharacter';

/**
 * HomepageHero Component
 * Main hero section with animated robots and futuristic design
 */
export default function HomepageHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <div className={styles.circuitPattern}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.robotsContainer}>
          <div className={styles.robot}>
            <RobotArm />
          </div>
          <div className={styles.character}>
            <HumanoidCharacter />
          </div>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>
            Physical AI & <br /> Humanoid Robotics
          </h1>
          <p className={styles.subtitle}>
            Explore the future of robotics through hands-on learning
          </p>
          <button className={styles.cta}>Start Learning</button>
        </div>
      </div>
    </section>
  );
}
