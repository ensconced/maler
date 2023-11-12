import shaders from "./shaders/shader.wgsl?raw";

function render(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeline: GPURenderPipeline,
): void {
  const renderPassDescriptor: GPURenderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        view: context.getCurrentTexture().createView(),
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  // make a command encoder to start encoding commands
  const encoder = device.createCommandEncoder({ label: "our encoder" });

  // make a render pass encoder to encode render specific commands
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.setPipeline(pipeline);
  pass.draw(3); // call our vertex shader 3 times.
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export default function main(
  device: GPUDevice,
  context: GPUCanvasContext,
  preferredTextureFormat: GPUTextureFormat,
): void {
  const module = device.createShaderModule({
    label: "our hardcoded red triangle shaders",
    code: shaders,
  });

  const pipeline = device.createRenderPipeline({
    label: "our hardcoded red triangle pipeline",
    layout: "auto",
    vertex: {
      module,
      entryPoint: "vs",
    },
    fragment: {
      module,
      entryPoint: "fs",
      targets: [{ format: preferredTextureFormat }],
    },
  });

  render(device, context, pipeline);
}
