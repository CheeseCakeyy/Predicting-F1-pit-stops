import type { Metadata } from "next";
import { InteractiveModelLab } from "../components/interactive-model-lab";

export const metadata: Metadata = {
  title: "Best Model Demo",
};

export default function ModelLabPage() {
  return <InteractiveModelLab />;
}
