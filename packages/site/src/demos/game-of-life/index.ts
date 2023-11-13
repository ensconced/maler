import shaders from "./shaders/shader.wgsl?raw";

const GRID_SIZE = 32;

const gridDimensions = new Float32Array([GRID_SIZE, GRID_SIZE]);

const vertices = new Float32Array([
  //   X,    Y,
  -0.8,
  -0.8, // Triangle 1
  0.8,
  -0.8,
  0.8,
  0.8,

  -0.8,
  -0.8, // Triangle 2
  0.8,
  0.8,
  -0.8,
  0.8,
]);

function render(
  device: GPUDevice,
  context: GPUCanvasContext,
  preferredTextureFormat: GPUTextureFormat,
): void {
  const gridDimensionsUniformBuffer = device.createBuffer({
    label: "Grid dimensions",
    size: gridDimensions.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(gridDimensionsUniformBuffer, 0, gridDimensions);

  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  const cellShaderModule = device.createShaderModule({
    label: "Cell shaders",
    code: shaders,
  });

  const cellPipeline = device.createRenderPipeline({
    label: "Cell pipeline",
    vertex: {
      module: cellShaderModule,
      entryPoint: "vertexMain",
      buffers: [
        {
          arrayStride: 8,
          attributes: [
            // position
            {
              format: "float32x2",
              offset: 0,
              shaderLocation: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: cellShaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: preferredTextureFormat,
        },
      ],
    },
    layout: "auto",
  });

  const cellRendererBindGroup = device.createBindGroup({
    label: "Cell renderer bind group",
    layout: cellPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: gridDimensionsUniformBuffer,
        },
      },
    ],
  });

  const renderPassDescriptor: GPURenderPassDescriptor = {
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 1, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };

  // make a command encoder to start encoding commands
  const encoder = device.createCommandEncoder({ label: "our encoder" });

  // make a render pass encoder to encode render specific commands
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.setPipeline(cellPipeline);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.setBindGroup(0, cellRendererBindGroup);
  pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);
  pass.end();
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export default function main(
  device: GPUDevice,
  context: GPUCanvasContext,
  preferredTextureFormat: GPUTextureFormat,
): void {
  render(device, context, preferredTextureFormat);
}
