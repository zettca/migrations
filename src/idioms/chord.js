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
  const isEmigration = store.get('isEmigration');
  const year = store.get('year') || 2010;
  const matrix = [];

  function getValue(c, c2) {
    let val;
    try {
      val = isEmigration ? data[year][c2][c] : data[year][c][c2];
    } catch (error) {
      val = 0;
    }
    return val || 0;
  }

  selectedCountries.forEach(c => {
    matrix.push(selectedCountries.map(c2 => getValue(c, c2)));
  });

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
  console.log('updating chord...');

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
    .range(d3.schemeSpectral[9]);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  groupNodes.selectAll('g')
    .data(chords.groups)
    .enter().append('g')
    .attr('class', 'node')
    .append('path')
    .attr('fill', (d, i) => color(i))
    .attr('stroke', (d, i) => color(i))
    .attr('d', arc)
    .append('title').text(d => `${selectedCountries[d.index]}: ${d3.format('~s')(d.value)}`);

  groupArcs.selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('class', 'arc')
    .attr('d', ribbon)
    .attr('fill', d => color(d.target.index))
    .attr('stroke', d => d3.rgb(color(d.target.index)).darker())
    .append('title').text(d => {
      const isEmigration = store.get('isEmigration');
      const countryOrder = isEmigration ? [d.source, d.target] : [d.target, d.source];
      const valueOrder = [d.source, d.target];
      const [c1, c2] = countryOrder.map(el => selectedCountries[el.index]);
      const [v1, v2] = valueOrder.map(el => d3.format('~s')(el.value));
      return `${c1} > ${c2}: ${v1}\n${c2} > ${c1}: ${v2}`;
    });

}
