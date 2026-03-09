"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export const GsapConfig = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
