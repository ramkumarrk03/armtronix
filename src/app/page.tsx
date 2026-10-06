import { Hero } from "@/components/hero/Hero";
import { SignalPath } from "@/components/signal-path/SignalPath";
import { HardwareRack } from "@/components/hardware/HardwareRack";
import { Paths } from "@/components/paths/Paths";
import { MadeInHubballi } from "@/components/about/MadeInHubballi";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <SignalPath />
      <HardwareRack />
      <Paths />
      <MadeInHubballi />
    </main>
  );
}
