import React, { useEffect, useMemo, useState } from "react";

type DemoMainFn = (
  device: GPUDevice,
  context: GPUCanvasContext,
  preferredTextureFormat: GPUTextureFormat,
) => void;

const demos: Record<string, DemoMainFn> = import.meta.glob(
  "../demos/*/index.ts",
  { import: "default", eager: true },
);

const firstDemoFilePath = Object.keys(demos)[0] ?? null;

async function runDemo(
  demoMainFn: DemoMainFn,
  context: GPUCanvasContext,
): Promise<void> {
  const preferredTextureFormat = navigator.gpu.getPreferredCanvasFormat();
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    throw new Error("no device");
  }
  context.configure({ device, format: preferredTextureFormat });
  demoMainFn(device, context, preferredTextureFormat);
}

export default function App(): React.ReactNode {
  const [selectedDemoFilePath, setSelectedDemoFilePath] = useState<
    string | null
  >(firstDemoFilePath);
  const selectedDemo = useMemo(() => {
    return selectedDemoFilePath && demos[selectedDemoFilePath];
  }, [selectedDemoFilePath]);
  const [wrapperDiv, setWrapperDiv] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (wrapperDiv && selectedDemo) {
      const canvas = document.createElement("canvas");
      canvas.height = 600;
      canvas.width = 600;
      wrapperDiv.appendChild(canvas);
      const ctx = canvas.getContext("webgpu");
      if (!ctx) {
        throw new Error("no context");
      }
      void runDemo(selectedDemo, ctx);
      return () => {
        wrapperDiv.removeChild(canvas);
      };
    }
  }, [selectedDemo, wrapperDiv]);

  return (
    <div ref={setWrapperDiv}>
      <select onChange={(evt) => setSelectedDemoFilePath(evt.target.value)}>
        {Object.entries(demos).map(([filePath]) => {
          return (
            <option key={filePath} value={filePath}>
              {filePath}
            </option>
          );
        })}
      </select>
    </div>
  );
}
