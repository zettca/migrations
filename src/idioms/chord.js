import * as d3 from 'd3';
import {
  selection, stateEmitter, createSVG, colors, countryName, tooltip
} from '../util';

export default {
  draw: drawChord,
  update: updateChord,
};

let chordSVG;
let countries, migrationData;
let outerRadius, innerRadius;

stateEmitter.on('yearChanged', () => updateChord());
stateEmitter.on('countriesChanged', () => updateChord());
stateEmitter.on('migrationChanged', () => updateChord());

function getChordMatrix() {
  countries = selection.getCountries();
  //countries = Object.keys(migrationData[2010]['WORLD']).slice(200, 230);

  const isEmigration = selection.getMigration();
  const year = selection.getYear();
  const matrix = [];

  function getValue(c, c2) {
    let val;
    try {
      val = isEmigration ? migrationData[year][c2][c] : migrationData[year][c][c2];
    } catch (error) {
      val = 0;
    }
    return val || 0;
  }

  countries.forEach(c => {
    matrix.push(countries.map(c2 => getValue(c, c2)));
  });

  return matrix;
}

export function drawChord(id, data) {
  const el = document.querySelector(id);
  const [width, height] = [el.clientWidth, el.clientHeight];

  chordSVG = createSVG(id, { width, height });
  outerRadius = Math.min(width, height) * 0.5;
  innerRadius = outerRadius - 20;

  migrationData = data;

  chordSVG.attr('viewBox', [-width / 2, -height / 2, width, height]);
  chordSVG.append('g').attr('class', 'nodes');
  chordSVG.append('g').attr('class', 'arcs');

  updateChord();
}

export function updateChord() {
  console.log('updating chord...');

  const groupNodes = chordSVG.select('.nodes');
  const groupArcs = chordSVG.select('.arcs');

  groupNodes.selectAll('.node').remove();
  groupArcs.selectAll('.arc').remove();

  const myChord = d3.chord().padAngle(0.02);

  const chords = myChord(getChordMatrix());
  const ribbon = d3.ribbon().radius(innerRadius);

  const color = d3.scaleOrdinal()
    .domain(d3.range(colors.selection.length))
    .range(colors.selection);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  if (chords.length === 0) return;

  const isEmi = selection.getMigration();
  const ms = isEmi ? 'emigration' : 'immigration';

  groupNodes.selectAll('g')
    .data(chords.groups)
    .enter().append('g')
    .attr('class', 'node')
    .append('path')
    .attr('fill', (d, i) => color(i))
    .attr('stroke', (d, i) => color(i))
    .attr('d', arc)
    .on('mousemove', tooltip.mousemove)
    .on('mouseout', mouseout)
    .on('mouseover', mouseover);

  groupArcs.selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('class', 'arc')
    .attr('fill', d => color(d.target.index))
    .attr('d', ribbon)
    .on('mouseover', d => tooltip.mouseover(makeTitle(d)))
    .on('mouseout', tooltip.mouseout)
    .on('mousemove', tooltip.mousemove);

  function makeTitle(d) {
    const countryOrder = isEmi ? [d.source, d.target] : [d.target, d.source];
    const valueOrder = [d.source, d.target];
    const [c1, c2] = countryOrder.map(el => countryName(countries[el.index]));
    const [v1, v2] = valueOrder.map(el => d3.format('~s')(el.value));
    return `${c1} ⟶ ${c2}: ${v1}<br/>${c2} ⟶ ${c1}: ${v2}`;
  }

  function mouseover(d, i) {
    //const t = d.value; // threshold
    const s = groupArcs.selectAll('.arc');
    s.classed('fade', (p) => p.source.index !== i && p.target.index !== i);
    s.classed('show', (p) => p.source.index === i);

    tooltip.mouseover(
      `<strong>${countryName(countries[d.index])}</strong> (${selection.getYear()})<br/>
      <big>${d3.format('~s')(d.value)}</big> ${ms.slice(0, -4)}nts<br/>`
    );
  }

  function mouseout(d, i) {
    groupArcs.selectAll('.arc.show').classed('show', false);
    groupArcs.selectAll('.arc.fade').classed('fade', false);
    tooltip.mouseout();
  }

}
