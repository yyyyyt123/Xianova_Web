import { getXianovaMarkPoints } from "./xianova-mark";

export type ParticleShape = 0 | 1 | 2;
export type ParticleField = {
  setShape: (shape: ParticleShape) => void;
  setAnimated: (animated: boolean) => void;
  dispose: () => void;
};

// Independently parameterised offset ribbon and soft optical-density grains.
// Retain the broad, closed silhouette; no reference-site node or shader runs here.
const VERTEX = `
precision highp float;
attribute vec2 a_surface;
attribute vec4 a_grain;
attribute vec3 a_mark;
uniform float u_time, u_dpr, u_density, u_reveal, u_scatter;
uniform vec3 u_weights;
uniform vec4 u_layout, u_title;
uniform vec2 u_size, u_pointer, u_tilt;
uniform float u_hover;
varying mediump float v_alpha, v_tone, v_signal;
const float TAU = 6.283185307179586;

mat3 turnX(float a) { float c=cos(a),s=sin(a); return mat3(1.,0.,0.,0.,c,s,0.,-s,c); }
mat3 turnY(float a) { float c=cos(a),s=sin(a); return mat3(c,0.,-s,0.,1.,0.,s,0.,c); }
mat3 turnZ(float a) { float c=cos(a),s=sin(a); return mat3(c,s,0.,-s,c,0.,0.,0.,1.); }

void surface(float u, float v, out vec3 point, out vec3 normal) {
  float c=cos(u),s=sin(u),c3=cos(3.*u+.2),s3=sin(3.*u+.2);
  float radius=1.+.075*c3+.045*sin(2.*u-.6);
  float radiusSlope=-.225*s3+.09*cos(2.*u-.6);
  vec3 centre=vec3(1.13*radius*c+.07*cos(2.*u+.3),
    .92*radius*s+.045*sin(3.*u), .18*sin(2.*u-.4)+.06*cos(3.*u));
  vec3 centreSlope=vec3(1.13*(radiusSlope*c-radius*s)-.14*sin(2.*u+.3),
    .92*(radiusSlope*s+radius*c)+.135*cos(3.*u), .36*cos(2.*u-.4)-.18*sin(3.*u));
  float breathing=.96+.04*cos(.17*u_time);
  float width=(.40+.055*cos(u-.4)+.025*sin(3.*u+.12*u_time))*breathing;
  float widthSlope=(-.055*sin(u-.4)+.075*cos(3.*u+.12*u_time))*breathing;
  float fold=.5*u+1.22+.052*u_time+.17*sin(2.*u-.11*u_time);
  float foldSlope=.5+.34*cos(2.*u-.11*u_time);
  vec3 radial=vec3(c,s,0.), radialSlope=vec3(-s,c,0.);
  vec3 span=cos(fold)*radial+vec3(0.,0.,sin(fold));
  vec3 spanSlope=cos(fold)*radialSlope-sin(fold)*foldSlope*radial+vec3(0.,0.,cos(fold)*foldSlope);
  point=centre+v*width*span;
  normal=normalize(cross(centreSlope+v*(widthSlope*span+width*spanSlope),span));
}

void main() {
  float angle=TAU*fract(a_surface.x+u_time*.0034);
  float across=(a_surface.y*2.-1.)*1.08;
  // A local geometric pattern is learned, carried along the surface, and
  // repeated in new regions: an abstract object-centric transfer sequence.
  // Remain on the existing ribbon; never replace it with a diagram or logo.
  float lesson=mod(u_time,24.);
  float transfer=smoothstep(4.,7.,lesson)*(1.-smoothstep(21.,24.,lesson));
  float progress=smoothstep(6.,20.,lesson);
  float source=smoothstep(.88,.997,cos(angle-.70));
  float targetA=smoothstep(.88,.997,cos(angle-2.85));
  float targetB=smoothstep(.88,.997,cos(angle-4.95));
  float learning=.2+.8*smoothstep(0.,2.,lesson)*(1.-smoothstep(4.,8.,lesson));
  float learned=source*learning;
  float reused=transfer*(targetA*smoothstep(9.,12.,lesson)+targetB*smoothstep(15.,18.,lesson));
  float aggregation=clamp(learned+reused,0.,1.);
  float constraint=(1.-smoothstep(.65,1.05,abs(across)))*u_weights.z;
  across-=sin(across*9.)*.035*aggregation*constraint;
  vec3 ribbon, ribbonNormal;
  surface(angle,across,ribbon,ribbonNormal);
  float phi=a_surface.y*TAU;
  vec3 ringNormal=vec3(cos(angle)*cos(phi),sin(angle)*cos(phi),sin(phi));
  vec3 ring=vec3(cos(angle),sin(angle),0.)+ringNormal*.26;
  float spatial=1.-u_weights.x;
  vec3 point=a_mark*u_weights.x+ring*u_weights.y+ribbon*u_weights.z;
  vec3 normal=normalize(vec3(0.,0.,1.)*u_weights.x+ringNormal*u_weights.y+ribbonNormal*u_weights.z);
  // A small subset of the existing buffer draws three different objects.
  // The same two contact anchors and constraint axis recur on each object.
  // Object shape changes, manipulation relationships remain transferable.
  float semantic=0., semanticActivation=0., route=0.;
  if (a_grain.x<.025 && u_weights.z>0.) {
    float scene=floor(a_grain.z*3.);
    float sceneAngle=scene<.5 ? .70 : (scene<1.5 ? 2.85 : 4.95);
    semanticActivation=scene<.5 ? learning : transfer*smoothstep(scene<1.5 ? 9. : 15.,scene<1.5 ? 12. : 18.,lesson);
    vec3 centre, objectNormal;
    surface(sceneAngle,0.,centre,objectNormal);
    vec3 tangent=normalize(vec3(-sin(sceneAngle),cos(sceneAngle),.12));
    vec3 transverse=normalize(cross(objectNormal,tangent));
    float contourAngle=a_surface.x*TAU;
    vec2 direction=vec2(cos(contourAngle),sin(contourAngle));
    float exponent=scene<.5 ? .30 : (scene<1.5 ? 1. : .42);
    vec2 contour=sign(direction)*pow(abs(direction),vec2(exponent));
    vec2 local=contour*vec2(scene>1.5 ? .25 : .21,scene<1.5 && scene>.5 ? .18 : .15);
    if (a_grain.x>=.017 && a_grain.x<.021) {
      local=vec2((a_surface.x*2.-1.)*.16,0.);
    } else if (a_grain.x>=.021) {
      float side=a_surface.x<.5 ? -1. : 1.;
      local=vec2(side*.16,0.)+vec2(cos(a_surface.y*TAU),sin(a_surface.y*TAU))*.010*sqrt(a_grain.y);
    }
    vec3 objectPoint=centre+tangent*local.x+transverse*local.y+objectNormal*.055;
    point=mix(point,objectPoint,u_weights.z);
    normal=normalize(mix(normal,objectNormal,u_weights.z));
    semantic=u_weights.z;
  }
  if (a_grain.x>=.025 && a_grain.x<.029 && u_weights.z>0.) {
    vec3 routePoint, routeNormal;
    surface(.70+TAU*a_surface.x,0.,routePoint,routeNormal);
    point=mix(point,routePoint+routeNormal*.055,u_weights.z);
    normal=normalize(mix(normal,routeNormal,u_weights.z));
    semantic=u_weights.z;
    semanticActivation=transfer*(1.-smoothstep(progress,progress+.06,a_surface.x));
    route=1.;
  }
  float arrival=clamp(u_reveal*1.35-a_grain.w*.35,0.,1.);
  arrival=arrival*arrival*(3.-2.*arrival);
  float rim=across*across;
  vec3 drift=normalize(a_grain.yzw-vec3(.4999));
  float spread=(1.-arrival)*(1.-arrival)*.65+u_scatter*u_scatter*.95;
  point+=drift*(.18+.62*a_grain.w)*spread+normal*(a_grain.z-.5)*.016*rim*spatial;
  mat3 rotation=turnX(-.86+.06*sin(u_time*.09)+u_tilt.y)
    *turnY(.22+.10*sin(u_time*.06)+u_tilt.x)*turnZ(.72+.10*sin(u_time*.07));
  point=mix(point,rotation*point,spatial);
  normal=normalize(mix(normal,rotation*normal,spatial));
  float cameraDepth=4.8-point.z;
  vec2 projected=point.xy*2.95/cameraDepth*vec2(1./u_layout.w,1.)*u_layout.z+u_layout.xy;
  vec2 pixel=(projected*.5+.5)*u_size;

  vec2 delta=pixel-u_pointer;
  float distance=length(delta);
  float proximity=exp(-dot(delta,delta)/(128.*128.))*u_hover;
  float wave=sin(distance*.055-u_time*1.7)*proximity;
  pixel+=delta/max(distance,1.)*wave*3.2;
  vec2 outside=abs(pixel-u_title.xy)-u_title.zw;
  float headingDistance=length(max(outside,0.))+min(max(outside.x,outside.y),0.);
  float clearText=mix(.06,1.,smoothstep(0.,155.,headingDistance));
  float edgeFade=smoothstep(35.,145.,u_size.y-pixel.y)*smoothstep(30.,130.,pixel.y);
  float facing=abs(dot(normal,normalize(vec3(-.32,.79,.52))));
  float grazing=pow(1.-facing,.85);
  float edgeProfile=exp(-pow(abs(across)/.96,8.));
  float softness=mix(.42,1.,smoothstep(0.,1.,cameraDepth/6.));
  float inkDensity=(.09+.53*grazing)*mix(1.,edgeProfile,u_weights.z);
  float pointerLift=max(0.,wave)*.035;
  v_alpha=mix(.38,inkDensity,spatial)*softness*clearText*edgeFade*arrival
    *(1.-smoothstep(.2,1.,u_scatter))*u_density*1.6;
  v_tone=mix(.1,.8*smoothstep(.08,.95,facing),spatial);
  float carrier=smoothstep(.89,.998,cos(angle-(.70+TAU*progress)))*transfer;
  float relationLane=exp(-across*across/.18);
  float pattern=.5+.5*cos(across*9.);
  v_alpha*=1.+aggregation*pattern*.24*u_weights.z;
  float objectClearance=max(source,max(targetA,targetB))*exp(-across*across/.16);
  v_alpha*=1.-objectClearance*.68*u_weights.z;
  v_signal=clamp((aggregation*pattern*.30+carrier*relationLane*.58+pointerLift)*u_weights.z,0.,.68);
  float anchor=step(.021,a_grain.x);
  float axis=step(.017,a_grain.x);
  float trace=smoothstep(a_surface.x-.08,a_surface.x+.08,.25+.75*semanticActivation);
  float featureAlpha=mix(.24,.64,anchor)*(.24+.76*semanticActivation)*mix(trace,1.,axis);
  featureAlpha=mix(featureAlpha,.24*semanticActivation,route);
  featureAlpha*=clearText*edgeFade*arrival*(1.-smoothstep(.2,1.,u_scatter));
  v_alpha=mix(v_alpha,featureAlpha,semantic);
  v_tone=mix(v_tone,.24,semantic);
  v_signal=mix(v_signal,mix(.30,.92,axis)*(.4+.6*semanticActivation),semantic);

  // Subpixel energy compensation: fine grains do not become opaque square pixels
  // on 1x displays. Quality reduction raises density slightly, never grain size.
  float cssDiameter=mix(.60,1.04,a_grain.y*a_grain.y)*clamp(4.8/cameraDepth,.86,1.12);
  float physicalDiameter=cssDiameter*u_dpr;
  v_alpha*=min(1.,physicalDiameter*physicalDiameter);
  v_alpha=min(.85,v_alpha);
  gl_Position=vec4(pixel/u_size*2.-1.,0.,1.);
  gl_PointSize=max(1.,physicalDiameter);
}
`;

const FRAGMENT = `
precision mediump float;
varying mediump float v_alpha, v_tone, v_signal;
void main() {
  vec2 q=gl_PointCoord*2.-1.;
  float r2=dot(q,q);
  if(r2>1.) discard;
  float optical=exp(-1.6*r2)*(1.-smoothstep(.35,1.,r2));
  float alpha=v_alpha*optical;
  vec3 graphite=vec3(.12,.17,.20), silver=vec3(.77,.81,.83);
  vec3 pigment=mix(mix(graphite,silver,v_tone),vec3(.16,.39,.46),v_signal);
  gl_FragColor=vec4(pigment*alpha,alpha);
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

  const capacity = Math.round(clamp(Math.max(innerWidth * innerHeight, (window.screen?.width || 0) * (window.screen?.height || 0) * .55) * .72, 180000, 800000));
  const points = new Float32Array(capacity * 9);
  const mark = getXianovaMarkPoints();
  let seed = 46297;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < capacity; i++) {
    const offset = i * 9;
    // Low-discrepancy surface coverage, with small deterministic jitter. This
    // avoids the coarse clumps produced by entirely random UV sampling.
    points[offset] = (i * .7548776662466927 + random() * .005) % 1;
    points[offset + 1] = (i * .5698402909980532 + random() * .005) % 1;
    for (let j = 2; j < 6; j++) points[offset + j] = random();
    const m = ((i * 337) % (mark.length / 2)) * 2;
    points[offset + 6] = mark[m] + (points[offset + 3] - .5) * .015;
    points[offset + 7] = mark[m + 1] + (points[offset + 4] - .5) * .015;
    points[offset + 8] = (points[offset + 5] - .5) * .09;
  }
  const grains = gl.createBuffer();
  if (!grains) { gl.deleteProgram(program); return null; }
  gl.bindBuffer(gl.ARRAY_BUFFER, grains);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  gl.useProgram(program);
  const attributes = [gl.getAttribLocation(program, "a_surface"), gl.getAttribLocation(program, "a_grain"), gl.getAttribLocation(program, "a_mark")];
  attributes.forEach(attribute => gl.enableVertexAttribArray(attribute));
  gl.vertexAttribPointer(attributes[0], 2, gl.FLOAT, false, STRIDE, 0);
  gl.vertexAttribPointer(attributes[1], 4, gl.FLOAT, false, STRIDE, 8);
  gl.vertexAttribPointer(attributes[2], 3, gl.FLOAT, false, STRIDE, 24);
  const uniforms = Object.fromEntries(["time", "dpr", "density", "reveal", "scatter", "weights", "layout", "title", "size", "pointer", "tilt", "hover"].map(name => [name, gl.getUniformLocation(program, `u_${name}`)]));
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
  let frame = 0, previous = 0, time = 0, revealAge = 2;
  let hasPlayed = false, scatter = 0;
  let shape: ParticleShape = 0;
  const weights = [1, 0, 0];
  let pointerX = -9999, pointerY = -9999, hover = 0, hoverTarget = 0;
  let tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  canvas.dataset.renderer = "webgl";
  canvas.dataset.surface = "xianova-offset-ribbon";
  canvas.dataset.grain = "soft-subpixel";
  canvas.dataset.narrative = "different-objects-shared-constraints";

  const draw = () => {
    if (disposed || gl.isContextLost()) return;
    const compact = width <= 1023;
    const aspect = width / height;
    const virtualHeight = Math.min(height, width * .5);
    const free = Math.max(.42, 1 - titleRight / width);
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
    scale *= 1 + .009 * Math.sin(time * .23);
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.dpr, dpr);
    gl.uniform1f(uniforms.density, clamp(wanted / activeCount, 1, 1.6));
    gl.uniform1f(uniforms.reveal, hasPlayed ? Math.min(1, revealAge / 1.9) : 1);
    gl.uniform1f(uniforms.scatter, hasPlayed ? scatter : 0);
    gl.uniform3f(uniforms.weights, weights[0], weights[1], weights[2]);
    gl.uniform4f(uniforms.layout, centreX, centreY, scale, aspect);
    gl.uniform4f(uniforms.title, titleZone[0], titleZone[1], titleZone[2], titleZone[3]);
    gl.uniform2f(uniforms.size, width, height);
    gl.uniform2f(uniforms.pointer, pointerX, height - pointerY);
    gl.uniform2f(uniforms.tilt, tiltX, tiltY);
    gl.uniform1f(uniforms.hover, hover);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, activeCount);
  };

  const running = () => animated && visible && !document.hidden && !disposed;
  const tick = (now: number) => {
    frame = 0;
    if (!running()) return;
    const elapsed = previous ? now - previous : 33.34;
    if (elapsed >= 32) {
      const dt = Math.min(elapsed / 1000, .1);
      const easing = 1 - Math.exp(-dt * 4.5);
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
    if (!wasNarrow && width <= 1023) { hover = hoverTarget = 0; tiltX = tiltY = targetTiltX = targetTiltY = 0; }
    const title = heading?.getBoundingClientRect();
    if (title) {
      titleRight = title.right - rect.left;
      titleTop = title.top - rect.top;
      titleBottom = title.bottom - rect.top;
      titleZone = [title.left - rect.left + title.width / 2, height - (title.top - rect.top + title.height / 2), title.width / 2, title.height / 2];
    }
    wanted = width * (width <= 1023 ? height : Math.min(height, width * .5)) * .72;
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
    targetTiltX = (event.clientX / innerWidth - .5) * .12;
    targetTiltY = (event.clientY / innerHeight - .5) * .08;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(leave, 1200);
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
      if (!value) {
        clearTimeout(idleTimer);
        hoverTarget = 0;
        // A compact viewport may pause before the first reveal frame. Commit a
        // visible static sculpture instead of freezing a transparent first frame.
        if (!hasPlayed || revealAge < 1.9) { revealAge = 1.9; draw(); }
      }
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
      gl.deleteProgram(program);
      canvas.dataset.motion = "disposed";
    },
  };
}
