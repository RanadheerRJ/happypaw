import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Adds a subtle 3D tilt on pointer move. Disabled under prefers-reduced-motion.
 * Wrap any card; the inner element receives the tilt transform.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  scale = 1.03,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const springRx = useSpring(rx, { stiffness: 150, damping: 18 });
  const springRy = useSpring(ry, { stiffness: 150, damping: 18 });

  const glowX = useTransform(springRx, [-max, max], ['0%', '100%']);
  const glowY = useTransform(springRy, [-max, max], ['0%', '100%']);
  const glow = useTransform([glowX, glowY], ([x, y]) =>
    `radial-gradient(circle at ${x} ${y}, rgba(224,106,59,0.10), transparent 60%)`,
  );

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduce ? undefined : { scale }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      style={
        reduce
          ? undefined
          : {
              rotateX: springRx,
              rotateY: springRy,
              transformStyle: 'preserve-3d',
            }
      }
      className={cn('relative', className)}
    >
      {children}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}
    </motion.div>
  );
}
