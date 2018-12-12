import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';

export default {
  draw: drawLines,
  update: updateLines,
};

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

let linesSVG;
let svgDims;
let migrationData;
let populationData;

function loadDataset() {
  const dataset = [];
  const countries = store.get('selectedCountries');
  if (!countries || countries.length === 0) return [];

  const isEmigration = store.get('isEmigration');

  for (let c of countries) {
    const country = [];
    for (let year in migrationData) {
      const dataYear = migrationData[year];
      if (dataYear[c] === undefined) continue; // no data

      const migrants = Number(isEmigration ? dataYear['WORLD'][c] : dataYear[c]['Total']);
      const pop = populationData[c][year] * 1000;
      const data = migrants /*/ pop*/;

      country.push({ year: Number(year), value: Number(data) });
    }
    dataset.push(country);
  }

  return dataset;
}

export function drawLines(id, width, height, data, pop) {
  svgDims = { width, height };
  linesSVG = createSVG(id, { width, height }, margin);
  migrationData = data;
  populationData = pop;

  updateLines();
}

export function updateLines() {
  console.log('updating lines...');

  const
    width = svgDims.width - margin.left - margin.right,
    height = svgDims.height - margin.top - margin.bottom;

  const dataset = loadDataset();

  const flatData = dataset.reduce((acc, d) => acc.concat(d), []);
  const getDomain = (dataset, fn) => [d3.min(dataset, fn), d3.max(dataset, fn)];

  const xScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d.year)).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d.value)).nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('~s'));

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // CLEAR OLD ELEMENTS

  linesSVG.selectAll('.dots').remove();
  linesSVG.selectAll('.line').remove();
  linesSVG.select('.xAxis').remove();
  linesSVG.select('.yAxis').remove();

  // CREATE NEW ELEMENTS

  linesSVG.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  linesSVG.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  for (let i = 0; i < dataset.length; i++) {
    const num = 6;
    const color = d3.schemeRdYlGn[num][i % num];

    linesSVG.append('path')
      .datum(dataset[i])
      .attr('stroke', color)
      .attr('class', 'line')
      .attr('d', line);

    linesSVG.append('g')
      .attr('class', 'dots')
      .attr('fill', color)
      .attr('stroke', color)
      .selectAll().data(dataset[i])
      .enter().append('circle')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 5);
  }
}
