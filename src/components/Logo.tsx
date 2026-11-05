import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";

type LogoProps = {
  /** Use white mark for dark backgrounds */
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
      src={publicAsset(inverted ? "/logo_white.png" : "/logo.png")}
      alt="夏仙创新 Xianova Robotics"
      width={1600}
      height={622}
      priority={priority}
      unoptimized
      className={`h-8 w-auto md:h-9 ${className}`}
    />
  );
}
