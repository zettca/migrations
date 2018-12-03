import * as d3 from 'd3';
import { createSVG } from '../helpers';

export default {
  draw: drawChord,
  update: updateChord,
};

let chordSVG;

export function drawChord(id, width, height, data) {
  chordSVG = createSVG(id, { width, height });

  function groupTicks(d, step) {
    const k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(value => {
      return { value: value, angle: value * k + d.startAngle };
    });
  }

  const
    outerRadius = Math.min(width, height) * 0.5 - 30,
    innerRadius = outerRadius - 20;

  chordSVG
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif');

  const myChord = d3.chord().padAngle(0.05).sortSubgroups(d3.descending);

  const chords = myChord(data);
  const ribbon = d3.ribbon().radius(innerRadius);

  const formatValue = d3.formatPrefix(',.0', 1e3);
  const color = d3.scaleOrdinal()
    .domain(d3.range(4))
    .range(['#c6dbef', '#6baed6', '#2171b5', '#08306b']);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);


  const group = chordSVG.append('g')
    .selectAll('g')
    .data(chords.groups)
    .enter().append('g');

  group.append('path')
    .attr('fill', d => color(d.index))
    .attr('stroke', d => d3.rgb(color(d.index)).darker())
    .attr('d', arc);

  const groupTick = group.append('g')
    .selectAll('g')
    .data(d => groupTicks(d, 1e3))
    .enter().append('g')
    .attr('transform', d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(${outerRadius},0)`);

  groupTick.append('line')
    .attr('stroke', '#000')
    .attr('x2', 6);

  groupTick
    .filter(d => d.value % 5e3 === 0)
    .append('text')
    .attr('x', 8)
    .attr('dy', '.35em')
    .attr('transform', d => d.angle > Math.PI ? 'rotate(180) translate(-16)' : null)
    .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
    .text(d => formatValue(d.value));

  chordSVG.append('g')
    .attr('fill-opacity', 0.67)
    .selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker());
}

export function updateChord(id, data) {

}
