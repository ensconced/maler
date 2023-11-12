import shaders from "./shaders/shader.wgsl?raw";

async function render(
  device: GPUDevice,
  pipeline: GPUComputePipeline,
): Promise<void> {
  const input = new Float32Array([1, 3, 5]);

  // create a buffer on the GPU to hold our computation
  // input and output
  const workBuffer = device.createBuffer({
    label: "work buffer",
    size: input.byteLength,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });
  // Copy our input data to that buffer
  device.queue.writeBuffer(workBuffer, 0, input);

  // create a buffer on the GPU to get a copy of the results
  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  // Setup a bindGroup to tell the shader which
  // buffer to use for the computation
  const bindGroup = device.createBindGroup({
    label: "bindGroup for work buffer",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: workBuffer } }],
  });

  // Encode commands to do the computation
  const encoder = device.createCommandEncoder({
    label: "doubling encoder",
  });
  const pass = encoder.beginComputePass({
    label: "doubling compute pass",
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(input.length);
  pass.end();

  // Encode a command to copy the results to a mappable buffer.
  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  // Now we can finish the encoder to get a command buffer and then submit that command buffer.

  // Finish encoding and submit the commands
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
  // We then map the results buffer and get a copy of the data

  // Read the results
  await resultBuffer.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(resultBuffer.getMappedRange());

  console.log("input", input);
  console.log("result", result);

  resultBuffer.unmap();
}

export default function main(device: GPUDevice): void {
  const module = device.createShaderModule({
    label: "doubling compute module",
    code: shaders,
  });

  const pipeline = device.createComputePipeline({
    label: "doubling compute pipeline",
    layout: "auto",
    compute: {
      module,
      entryPoint: "computeSomething",
    },
  });

  void render(device, pipeline);
}
