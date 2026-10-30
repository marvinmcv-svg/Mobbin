import type { Platform } from "@/lib/data/types";

/** Column count per platform: wide site sections get two columns, phone screens five. */
export const GRID_CLASSES: Record<Platform, string> = {
  site: "grid-cols-1 min-[900px]:grid-cols-2 gap-x-6 gap-y-10",
  web: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10",
  ios: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6",
  android: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6",
};
