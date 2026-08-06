import Image from "next/image";

type LogoProps = {
  /** Invert to white for dark backgrounds */
  inverted?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Official Xianova wordmark (icon + Chinese + English).
 * @param inverted, white version for dark surfaces
 * @param className, optional sizing classes
 * @param priority, next/image priority load
 */
export function Logo({ inverted = false, className = "", priority }: LogoProps) {
  return (
    <Image
      src="/logo.png?v=2"
      alt="夏仙创新 Xianova Robotics"
      width={1024}
      height={397}
      priority={priority}
      unoptimized
      className={`h-8 w-auto md:h-9 ${inverted ? "brightness-0 invert" : ""} ${className}`}
    />
  );
}
