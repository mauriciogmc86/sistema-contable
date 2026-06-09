"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/presentation/components/molecules/Skeleton";
import type { ChartImplProps } from "./ChartImpl";

/** Recharts is heavy: load it only on the client and code-split it out of the main bundle. */
const ChartImpl = dynamic(() => import("./ChartImpl"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />,
});

export type { ChartDatum } from "./ChartImpl";

export function Chart(props: ChartImplProps) {
  return <ChartImpl {...props} />;
}
