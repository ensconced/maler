@group(0) @binding(0) var<uniform> grid: vec2f;

@vertex
fn vertexMain(
    @location(0) pos: vec2f,
    @builtin(instance_index) instance: u32
) -> @builtin(position) vec4f {
  let scaled = pos / grid;
  let shiftedToOriginCell = scaled + (vec2f(1, 1) / grid) - 1;
  let offset = vec2f(f32(instance % u32(grid.x)), f32(instance / u32(grid.x))) * 2 / grid;
  return vec4f(shiftedToOriginCell + offset, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(1, 0, 0, 1);
}