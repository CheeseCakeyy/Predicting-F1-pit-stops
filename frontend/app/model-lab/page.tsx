import type { Metadata } from "next";
import { InteractiveModelLab } from "../components/interactive-model-lab";

export const metadata: Metadata = {
  title: "Baseline Model Demo",
};

export default function ModelLabPage() {
  return <InteractiveModelLab />;
}
