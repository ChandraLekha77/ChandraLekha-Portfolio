import { BufferAttribute, BufferGeometry, DynamicDrawUsage, OrthographicCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";

export function createParticleRenderer(canvas) {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, preserveDrawingBuffer: true });
  if (!gl) return null;
  const renderer = new WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 0, 1, -1000, 1000);
  camera.position.z = 100;
  const geometry = new BufferGeometry();
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { pixelRatio: { value: 1 } },
    vertexShader: `
      attribute vec4 style;
      attribute vec3 tint;
      uniform float pixelRatio;
      varying vec4 vStyle;
      varying vec3 vTint;
      void main() {
        vStyle = style;
        vTint = tint;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = style.x * 2.0 * pixelRatio * mix(1.3, 5.0, step(0.01, style.z));
      }
    `,
    fragmentShader: `
      varying vec4 vStyle;
      varying vec3 vTint;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float extent = mix(1.3, 5.0, step(0.01, vStyle.z));
        float core = 1.0 - smoothstep(0.7 / extent, 1.0 / extent, d);
        float glow = exp(-d * d * 6.0) * vStyle.z * 0.12;
        float alpha = vStyle.y * max(core, glow);
        if (alpha < 0.003) discard;
        vec3 color = mix(vTint, vec3(1.0), core * vStyle.w * 0.2);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  let positions, colours, styles;
  return {
    resize(width, height, dpr, count) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      material.uniforms.pixelRatio.value = dpr;
      positions = new Float32Array(count * 3);
      colours = new Float32Array(count * 3);
      styles = new Float32Array(count * 4);
      geometry.setAttribute("position", new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage));
      geometry.setAttribute("tint", new BufferAttribute(colours, 3).setUsage(DynamicDrawUsage));
      geometry.setAttribute("style", new BufferAttribute(styles, 4).setUsage(DynamicDrawUsage));
    },
    point(index, x, y, z, colour, alpha, radius, glow = 0, pulse = 0) {
      const vertex = index * 3;
      const style = index * 4;
      positions[vertex] = x;
      positions[vertex + 1] = y;
      positions[vertex + 2] = z;
      for (let channel = 0; channel < 3; channel++) colours[vertex + channel] = colour[channel] / 255;
      styles[style] = radius;
      styles[style + 1] = alpha;
      styles[style + 2] = glow;
      styles[style + 3] = pulse;
    },
    render() {
      for (const attribute of Object.values(geometry.attributes)) attribute.needsUpdate = true;
      renderer.render(scene, camera);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    }
  };
}
