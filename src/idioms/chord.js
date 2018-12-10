import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';

export default {
  draw: drawChord,
  update: updateChord,
};

let chordSVG;
let selectedCountries;
let migrationData;

let outerRadius, innerRadius;

function getChordMatrix(data) {
  selectedCountries = store.get('selectedCountries') || ['PRT', 'DEU', 'BRA', 'ESP', 'SWE', 'ITA'];
  const year = store.get('year') || 2010;
  const matrix = [];

  selectedCountries.forEach(c => {
    matrix.push(selectedCountries.map(co => data[year][c][co]));
  });

  console.log(matrix);
  return matrix;
}

export function drawChord(id, width, height, data) {
  chordSVG = createSVG(id, { width, height });

  migrationData = data;

  outerRadius = Math.min(width, height) * 0.5 - 30;
  innerRadius = outerRadius - 20;

  chordSVG.attr('viewBox', [-width / 2, -height / 2, width, height]);

  chordSVG.append('g')
    .attr('class', 'nodes');

  chordSVG.append('g')
    .attr('class', 'arcs')
    .attr('fill-opacity', 0.8);

  updateChord();
}

export function updateChord() {
  const groupNodes = chordSVG.select('.nodes');
  const groupArcs = chordSVG.select('.arcs');

  groupNodes.selectAll('.node').remove();
  groupArcs.selectAll('.arc').remove();

  const myChord = d3.chord()
    .padAngle(0.04)
    .sortSubgroups(d3.descending);

  const chords = myChord(getChordMatrix(migrationData));
  const ribbon = d3.ribbon().radius(innerRadius);

  const color = d3.scaleOrdinal()
    .domain(d3.range(9))
    .range(d3.schemeBlues[9]);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  groupNodes.selectAll('g')
    .data(chords.groups)
    .enter().append('g')
    .attr('class', 'node')
    .append('path')
    .attr('fill', d => color(d.index))
    .attr('stroke', d => color(d.index))
    .attr('d', arc)
    .append('title').text(d => `${selectedCountries[d.index]}: ${d.value}`);

  groupArcs.selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('class', 'arc')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker())
    .append('title').text(d => {
      const c1 = selectedCountries[d.source.index];
      const c2 = selectedCountries[d.target.index];
      return `${d.source.value} ${c1} > ${c2} | ${d.target.value} ${c2} > ${c1} `;
    });




}
