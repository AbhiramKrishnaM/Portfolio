const STEP_MS = 1000 / 60;
const WALL = 200;

export async function createStackPhysics() {
  const matterModule = await import("matter-js");
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = matterModule.default ?? matterModule;

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1.1;

  let walls = [];
  let boxBody = null;
  let bodies = [];
  let drag = null;

  function setBounds({ left, right, bottom, top }, box) {
    Composite.remove(engine.world, walls);
    if (boxBody) Composite.remove(engine.world, boxBody);
    const width = right - left;
    const height = bottom - top;
    walls = [
      Bodies.rectangle(left + width / 2, bottom + WALL / 2, width + WALL * 2, WALL, { isStatic: true }),
      Bodies.rectangle(left - WALL / 2, top + height / 2, WALL, height * 3, { isStatic: true }),
      Bodies.rectangle(right + WALL / 2, top + height / 2, WALL, height * 3, { isStatic: true }),
      Bodies.rectangle(left + width / 2, top - height - WALL / 2, width + WALL * 2, WALL, { isStatic: true }),
    ];
    boxBody = Bodies.rectangle(box.x, box.y, box.width, box.height, { isStatic: true, chamfer: { radius: 6 } });
    Composite.add(engine.world, [...walls, boxBody]);
    bodies.forEach((b) => Sleeping.set(b, false));
  }

  function spill(count, size, mouth, onEach) {
    clear();
    bodies = Array.from({ length: count }, () => {
      const body = Bodies.rectangle(mouth.x, mouth.y - size / 2 - 6, size, size, {
        chamfer: { radius: 8 },
        restitution: 0.35,
        friction: 0.45,
        frictionAir: 0.012,
        density: 0.002,
      });
      Body.setInertia(body, body.inertia * 5);
      body.plugin.bornAt = 0;
      return body;
    });
    bodies.forEach((body, i) => {
      setTimeout(() => {
        if (!bodies.includes(body)) return;
        const side = i % 2 === 0 ? -1 : 1;
        Body.setPosition(body, { x: mouth.x + side * (4 + Math.random() * 10), y: mouth.y - size / 2 - 6 });
        Body.setVelocity(body, { x: side * (2.5 + Math.random() * 4.5), y: -(13 + Math.random() * 5) });
        Body.setAngularVelocity(body, side * (0.004 + Math.random() * 0.008));
        body.plugin.bornAt = performance.now();
        Composite.add(engine.world, body);
        onEach?.(i);
      }, i * 110);
    });
  }

  function clear() {
    endDrag();
    Composite.remove(engine.world, bodies);
    bodies = [];
  }

  function step() {
    if (drag) Sleeping.set(drag.body, false);
    Engine.update(engine, STEP_MS);
  }

  function snapshot() {
    return bodies.map((b) => ({
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      bornAt: b.plugin.bornAt,
      live: Composite.get(engine.world, b.id, "body") !== null,
    }));
  }

  function startDrag(index, point) {
    const body = bodies[index];
    if (!body) return;
    endDrag();
    const offset = { x: point.x - body.position.x, y: point.y - body.position.y };
    const local = {
      x: offset.x * Math.cos(-body.angle) - offset.y * Math.sin(-body.angle),
      y: offset.x * Math.sin(-body.angle) + offset.y * Math.cos(-body.angle),
    };
    const constraint = Constraint.create({
      pointA: { x: point.x, y: point.y },
      bodyB: body,
      pointB: { x: local.x, y: local.y },
      stiffness: 0.18,
      damping: 0.08,
      length: 0,
    });
    Composite.add(engine.world, constraint);
    Sleeping.set(body, false);
    drag = { body, constraint };
  }

  function moveDrag(point) {
    if (!drag) return;
    drag.constraint.pointA.x = point.x;
    drag.constraint.pointA.y = point.y;
  }

  function endDrag() {
    if (!drag) return;
    Composite.remove(engine.world, drag.constraint);
    drag = null;
  }

  function dispose() {
    clear();
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  }

  return {
    setBounds,
    spill,
    clear,
    step,
    snapshot,
    startDrag,
    moveDrag,
    endDrag,
    dispose,
    get count() { return bodies.length; },
  };
}
