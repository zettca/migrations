import { select } from 'd3';

export function createSVG(id, dims = { width: 400, height: 400 }, margins) {
  const el = select(id).append('svg')
    .attr('width', dims.width)
    .attr('height', dims.height);
  if (margins !== undefined) {
    el.append('g').attr('transform', `translate(${margins.left || 0},${margins.top || 0})`);
  }
  return el;
}
