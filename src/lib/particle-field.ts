import { getXianovaMarkPoints } from "./xianova-mark";

export type ParticleShape = 0 | 1 | 2;
export type ParticleField = {
  setShape: (shape: ParticleShape) => void;
  setAnimated: (animated: boolean) => void;
  dispose: () => void;
};

// Reference measurements, mathematical surface and lighting are documented in
// docs/particle-home.md. No third-party script is executed by this renderer.
const VERTEX = `
precision highp float;
attribute vec2 a_surface;
attribute vec4 a_grain;
attribute vec3 a_mark;
uniform float u_time, u_dpr, u_grainScale, u_reveal, u_scatter, u_node;
uniform vec3 u_weights;
uniform vec4 u_layout, u_title;
uniform vec2 u_size, u_pointer, u_tilt;
uniform float u_hover;
varying mediump float v_alpha, v_tone;
const float TAU = 6.283185307179586;

mat3 turnX(float a) { float c=cos(a),s=sin(a); return mat3(1.,0.,0.,0.,c,s,0.,-s,c); }
mat3 turnY(float a) { float c=cos(a),s=sin(a); return mat3(c,0.,-s,0.,1.,0.,s,0.,c); }
mat3 turnZ(float a) { float c=cos(a),s=sin(a); return mat3(c,s,0.,-s,c,0.,0.,0.,1.); }

// Half-twist ribbon, with analytic partial derivatives for its actual normal.
void ribbon(float angle, float across, out vec3 position, out vec3 normal) {
  float c=cos(angle), s=sin(angle);
  float twist=angle*.5+u_time*.085+.8;
  float ct=cos(twist), st=sin(twist);
  float width=.46*(1.+.12*sin(2.*angle-.05*u_time));
  float widthSlope=.1104*cos(2.*angle-.05*u_time);
  vec3 radial=vec3(c,s,0.);
  vec3 radialSlope=vec3(-s,c,0.);
  vec3 direction=ct*radial+vec3(0.,0.,st);
  vec3 directionSlope=ct*radialSlope-.5*st*radial+vec3(0.,0.,.5*ct);
  vec3 spine=vec3(1.22*c,.92*s,.22*sin(2.*angle+.5));
  vec3 spineSlope=vec3(-1.22*s,.92*c,.44*cos(2.*angle+.5));
  position=spine+across*width*direction;
  normal=normalize(cross(spineSlope+across*(widthSlope*direction+width*directionSlope),direction));
}

void main() {
  float along=a_surface.x;
  float angle=TAU*(along+.005*u_time);
  float across=(a_surface.y*2.-1.)*1.15;
  if(u_node>.5) { angle=u_time*.14-along*.6; across=.5*sin(angle*1.5+.4); }
  vec3 band, bandNormal;
  ribbon(angle,across,band,bandNormal);
  float tubeAngle=a_surface.y*TAU;
  vec3 ringNormal=vec3(cos(angle)*cos(tubeAngle),sin(angle)*cos(tubeAngle),sin(tubeAngle));
  vec3 ring=vec3(cos(angle),sin(angle),0.)+ringNormal*.26;
  vec3 position=a_mark*u_weights.x+ring*u_weights.y+band*u_weights.z;
  vec3 normal=normalize(vec3(0.,0.,1.)*u_weights.x+ringNormal*u_weights.y+bandNormal*u_weights.z);

  float edgeWeight=across*across;
  float rimProfile=exp(-pow(abs(across)/.92,6.));
  float speck=step(.92,fract(a_grain.x*9.17+a_grain.y*5.31));
  float assembly=smoothstep(0.,1.,clamp(u_reveal*1.9-a_grain.w*.5-along*.4,0.,1.));
  vec3 randomDirection=normalize(a_grain.yzw-vec3(.4999));
  float dispersion=(1.-assembly)*1.1+pow(u_scatter*(.55+.9*a_grain.y),2.)*1.7;
  position+=(randomDirection*.85+normal*(a_grain.z-.5))*dispersion*(.25+a_grain.w);
  position+=(normal*(a_grain.z-.5)*.09*edgeWeight+randomDirection*.03*edgeWeight*abs(across)
    +randomDirection*speck*(.04+.22*a_grain.w))*u_weights.z;

  mat3 orientation=turnX(-.98+u_tilt.y)*turnY(.28+u_tilt.x)*turnZ(.55+.3*sin(.04*u_time));
  float spatial=1.-u_weights.x;
  position=mix(position,orientation*position,spatial);
  normal=normalize(mix(normal,orientation*normal,spatial));
  if(normal.z<0.) normal=-normal;
  float depth=4.2-position.z;
  vec2 ndc=position.xy*2.6/depth*vec2(1./u_layout.w,1.)*u_layout.z+u_layout.xy;
  vec2 pixel=(ndc*.5+.5)*u_size;
  vec2 delta=pixel-u_pointer;
  float radius=150.;
  pixel+=normalize(delta+vec2(.001))*exp(-dot(delta,delta)/(radius*radius))*u_hover*radius*.38*(.45+a_grain.y);

  vec2 box=abs(pixel-u_title.xy)-u_title.zw;
  float titleDistance=length(max(box,0.))+min(max(box.x,box.y),0.);
  float visibility=mix(.08,1.,smoothstep(0.,190.,titleDistance));
  visibility*=smoothstep(0.,170.,u_size.y-pixel.y)*smoothstep(0.,160.,pixel.y);
  vec3 lamp=normalize(vec3(-.45,.62,.64));
  float illumination=clamp(dot(normal,lamp)*.5+.5,0.,1.);
  float shadow=pow(smoothstep(0.,1.,1.-illumination),1.15);
  float probability=(.2+.8*shadow)*visibility*mix(1.,rimProfile,u_weights.z);
  float selection=1.-smoothstep(probability-.025,probability+.025,a_grain.x);
  float distanceTone=clamp((depth-2.7)/3.,0.,1.);
  v_alpha=selection*smoothstep(0.,.03,probability)*mix(.9,.5,distanceTone)*assembly
    *(1.-smoothstep(.12,1.,u_scatter))*mix(1.,.35,speck*u_weights.z);
  v_tone=clamp((1.-shadow)*.88+(a_grain.w-.5)*.25,0.,1.);
  float pointSize=u_grainScale*mix(1.,1.9,a_grain.y)*mix(1.2,.85,distanceTone)
    *mix(1.,1.35,1.-shadow)*mix(1.,.75,edgeWeight*u_weights.z)*mix(1.,.8,speck*u_weights.z);
  if(u_node>.5) {
    v_alpha=(along<.001?1.:.62*pow(1.-along,1.4))*smoothstep(0.,.5,visibility)
      *assembly*(1.-smoothstep(0.,.5,u_scatter))*u_weights.z;
    pointSize=(along<.001?8.:mix(2.6,1.3,along))*mix(1.25,.8,distanceTone);
    v_tone=0.;
  }
  gl_Position=vec4(pixel/u_size*2.-1.,0.,1.);
  gl_PointSize=u_dpr*pointSize;
}
`;

const FRAGMENT = `
precision mediump float;
uniform highp float u_node;
varying mediump float v_alpha, v_tone;
void main() {
  if(v_alpha<.01) discard;
  float coverage=u_node>.5?1.:1.-smoothstep(.3,.5,length(gl_PointCoord-vec2(.5)));
  float opacity=v_alpha*coverage;
  vec3 ink=vec3(.141,.145,.145);
  vec3 paper=vec3(.80,.805,.80);
  gl_FragColor=vec4(mix(ink,paper,v_tone)*opacity,opacity);
}
`;

const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
const STRIDE = 9 * 4;

export function createParticleField(canvas: HTMLCanvasElement): ParticleField | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null;
  const compile = (kind: number, source: string) => {
    const shader = gl.createShader(kind);
    if (!shader) throw new Error("Particle shader allocation failed");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const reason = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(reason || "Particle shader compilation failed");
    }
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  let fragment: WebGLShader;
  try { fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT); }
  catch (error) { gl.deleteShader(vertex); throw error; }
  const program = gl.createProgram();
  if (!program) { gl.deleteShader(vertex); gl.deleteShader(fragment); return null; }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const reason = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(reason || "Particle program linking failed");
  }

  const capacity = Math.round(clamp(Math.max(innerWidth * innerHeight, (window.screen?.width || 0) * (window.screen?.height || 0) * .55) * .5, 150000, 720000));
  const points = new Float32Array(capacity * 9);
  const mark = getXianovaMarkPoints();
  let seed = 20261009;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < capacity; i++) {
    const offset = i * 9;
    // Keep surface sampling independent of the optional brand-mark coordinates.
    for (let j = 0; j < 6; j++) points[offset + j] = random();
    const m = ((i * 337) % (mark.length / 2)) * 2;
    points[offset + 6] = mark[m] + (points[offset + 3] - .5) * .015;
    points[offset + 7] = mark[m + 1] + (points[offset + 4] - .5) * .015;
    points[offset + 8] = (points[offset + 5] - .5) * .09;
  }
  const nodeCount = 15;
  const nodePoints = new Float32Array(nodeCount * 9);
  for (let i = 0; i < nodeCount; i++) {
    nodePoints[i * 9] = i / nodeCount;
    nodePoints[i * 9 + 3] = .5;
  }
  const grains = gl.createBuffer(), node = gl.createBuffer();
  if (!grains || !node) { gl.deleteBuffer(grains); gl.deleteBuffer(node); gl.deleteProgram(program); return null; }
  gl.bindBuffer(gl.ARRAY_BUFFER, grains);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, node);
  gl.bufferData(gl.ARRAY_BUFFER, nodePoints, gl.STATIC_DRAW);
  gl.useProgram(program);
  const attributes = [gl.getAttribLocation(program, "a_surface"), gl.getAttribLocation(program, "a_grain"), gl.getAttribLocation(program, "a_mark")];
  attributes.forEach(attribute => gl.enableVertexAttribArray(attribute));
  const bind = (buffer: WebGLBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attributes[0], 2, gl.FLOAT, false, STRIDE, 0);
    gl.vertexAttribPointer(attributes[1], 4, gl.FLOAT, false, STRIDE, 8);
    gl.vertexAttribPointer(attributes[2], 3, gl.FLOAT, false, STRIDE, 24);
  };
  const uniforms = Object.fromEntries(["time", "dpr", "grainScale", "reveal", "scatter", "node", "weights", "layout", "title", "size", "pointer", "tilt", "hover"].map(name => [name, gl.getUniformLocation(program, `u_${name}`)]));
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const hero = canvas.closest("section");
  const heading = hero?.querySelector("h1");
  let width = 1, height = 1, dpr = 1, wanted = capacity, activeCount = capacity;
  let quality = 1, slowFrames = 0, sampleFrames = 0;
  let titleRight = 0, titleTop = 0, titleBottom = 0;
  let titleZone = [0, 0, 0, 0];
  let disposed = false, animated = false, visible = true;
  let frame = 0, previous = 0, time = innerWidth <= 1023 || matchMedia("(prefers-reduced-motion: reduce)").matches ? 46 : 40, revealAge = 3;
  let hasPlayed = false, scatter = 0;
  let shape: ParticleShape = 0;
  const weights = [1, 0, 0];
  let pointerX = -9999, pointerY = -9999, hover = 0, hoverTarget = 0;
  let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  canvas.dataset.renderer = "webgl";
  canvas.dataset.surface = "mobius-band";

  const draw = () => {
    if (disposed || gl.isContextLost()) return;
    const compact = width <= 1023;
    const aspect = width / height;
    const virtualHeight = Math.min(height, width * .5);
    const free = Math.max(.42, 1 - titleRight / width);
    // The reference sculpture is composed in a 2:1 stage. Keep that camera
    // framing inside our full-height hero, rather than stretching the surface.
    let scale = clamp(Math.min(free * 2.2, 1.32) * Math.pow(Math.min(width / virtualHeight / 1.6, 1), .3), .6, 1.32) * virtualHeight / height;
    let centreX = 1 - free - .06;
    let centreY = 0;
    if (compact) {
      const below = height - titleBottom - 40, above = titleTop - 108;
      const top = below >= above ? titleBottom + 12 : 108;
      const bottom = below >= above ? height - 24 : titleTop - 24;
      scale = clamp(Math.min((bottom - top) / (.58 * height), width * 1.02 / (.93 * height)), .3, 1.3);
      centreX = .12;
      centreY = 1 - (top + bottom) / height;
    }
    const breath = hasPlayed ? 1 + .015 * Math.sin(time * .45) : 1;
    scale *= breath;
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.dpr, dpr);
    gl.uniform1f(uniforms.grainScale, clamp(Math.sqrt(wanted / activeCount), 1, 1.6));
    gl.uniform1f(uniforms.reveal, hasPlayed ? 1 - Math.pow(1 - Math.min(1, revealAge / 2.8), 3) : 1);
    gl.uniform1f(uniforms.scatter, hasPlayed ? scatter : 0);
    gl.uniform3f(uniforms.weights, weights[0], weights[1], weights[2]);
    gl.uniform4f(uniforms.layout, centreX, centreY, scale, aspect);
    gl.uniform4f(uniforms.title, titleZone[0], titleZone[1], titleZone[2], titleZone[3]);
    gl.uniform2f(uniforms.size, width, height);
    gl.uniform2f(uniforms.pointer, pointerX, height - pointerY);
    gl.uniform2f(uniforms.tilt, tiltX, tiltY);
    gl.uniform1f(uniforms.hover, hover);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uniforms.node, 0);
    bind(grains);
    gl.drawArrays(gl.POINTS, 0, activeCount);
    gl.uniform1f(uniforms.node, 1);
    bind(node);
    gl.drawArrays(gl.POINTS, 0, nodeCount);
  };

  const running = () => animated && visible && !document.hidden && !disposed;
  const tick = (now: number) => {
    frame = 0;
    if (!running()) return;
    const elapsed = previous ? now - previous : 33.34;
    if (elapsed >= 32) {
      const dt = Math.min(elapsed / 1000, .1);
      const easing = 1 - Math.exp(-dt * 5);
      time += dt;
      revealAge += dt;
      hover += (hoverTarget - hover) * easing;
      tiltX += (targetTiltX - tiltX) * easing * .5;
      tiltY += (targetTiltY - tiltY) * easing * .5;
      for (let i = 0; i < 3; i++) weights[i] += ((shape === i ? 1 : 0) - weights[i]) * easing;
      draw();
      if (previous && elapsed > 50 && elapsed < 250) slowFrames++;
      if (++sampleFrames === 60) {
        if (slowFrames > 20 && quality > .36) {
          quality = Math.max(.36, quality * .8);
          activeCount = Math.round(clamp(wanted, 90000, capacity) * quality);
          canvas.dataset.particles = String(activeCount);
        }
        sampleFrames = slowFrames = 0;
      }
      previous = now;
    }
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (running()) {
      canvas.dataset.motion = "running";
      if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
    } else {
      if (frame) cancelAnimationFrame(frame);
      frame = previous = 0;
      canvas.dataset.motion = "paused";
    }
  };
  const measure = () => {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const wasNarrow = width <= 1023;
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    if (!wasNarrow && width <= 1023) { time = 46; hover = hoverTarget = 0; tiltX = tiltY = targetTiltX = targetTiltY = 0; }
    const title = heading?.getBoundingClientRect();
    if (title) {
      titleRight = title.right - rect.left;
      titleTop = title.top - rect.top;
      titleBottom = title.bottom - rect.top;
      titleZone = [title.left - rect.left + title.width / 2, height - (title.top - rect.top + title.height / 2), title.width / 2, title.height / 2];
    }
    wanted = width * (width <= 1023 ? height : Math.min(height, width * .5)) * .5;
    activeCount = Math.round(clamp(wanted, 90000, capacity) * quality);
    canvas.dataset.particles = String(activeCount);
    dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4000000 / (width * height)));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };
  const leave = () => { hoverTarget = 0; };
  const move = (event: PointerEvent) => {
    if (!animated || event.pointerType !== "mouse") return;
    const rect = canvas.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    hoverTarget = 1;
    targetTiltX = (event.clientX / innerWidth - .5) * .2;
    targetTiltY = (event.clientY / innerHeight - .5) * .14;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(leave, 1400);
  };
  const scroll = () => {
    if (!hero) return;
    scatter = clamp(-hero.getBoundingClientRect().top / (hero.offsetHeight * .85), 0, 1);
  };
  const visibility = () => { sync(); };
  const lost = (event: Event) => { event.preventDefault(); if (frame) cancelAnimationFrame(frame); frame = 0; };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio > .1; sync(); }, { threshold: .1 });
  const resizeObserver = new ResizeObserver(measure);
  observer.observe(canvas);
  resizeObserver.observe(canvas);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave, { passive: true });
  window.addEventListener("scroll", scroll, { passive: true });
  hero?.addEventListener("animationend", measure);
  canvas.addEventListener("webglcontextlost", lost);
  document.fonts?.ready.then(() => { if (!disposed) measure(); });
  measure();
  scroll();
  sync();

  return {
    setShape(next) {
      shape = next;
      if (!animated) { weights.forEach((_, i) => { weights[i] = i === next ? 1 : 0; }); draw(); }
    },
    setAnimated(value) {
      if (value && !hasPlayed) { hasPlayed = true; revealAge = 0; }
      animated = value;
      if (!value) { clearTimeout(idleTimer); hoverTarget = 0; if (!hasPlayed) draw(); }
      sync();
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", scroll);
      hero?.removeEventListener("animationend", measure);
      canvas.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(grains);
      gl.deleteBuffer(node);
      gl.deleteProgram(program);
      canvas.dataset.motion = "disposed";
    },
  };
}
