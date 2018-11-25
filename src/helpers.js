import { select } from 'd3';

export function makeSVG(id, width, height) {
  return select(id).append('svg')
    .attr('width', width)
    .attr('height', height);
}
