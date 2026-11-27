import test from 'node:test';
import assert from 'node:assert/strict';
import { pointerPercent } from './hero-motion.js';

test('converte o cursor para um ponto limitado dentro do hero', () => {
  assert.deepEqual(pointerPercent({ clientX: 250, clientY: 50 }, { left: 100, top: 0, width: 200, height: 100 }), { x: 75, y: 50 });
  assert.deepEqual(pointerPercent({ clientX: -20, clientY: 300 }, { left: 0, top: 0, width: 100, height: 100 }), { x: 0, y: 100 });
});
