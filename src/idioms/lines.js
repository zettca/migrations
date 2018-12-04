import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';

export default {
  draw: drawLines,
  update: updateLines,
};

let group;
let svgDims;
let dataYears;

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

export function drawLines(id, width, height, data) {
  svgDims = { width, height };
  group = createSVG(id, { width, height }, margin);
  dataYears = data;

  updateLines(width, height);
}

export function updateLines() {
  const
    width = svgDims.width - margin.left - margin.right,
    height = svgDims.height - margin.top - margin.bottom;

  const dataset = [];
  const countries = store.get('selectedCountries');
  if (!countries || countries.length === 0) return;
  for (let country of countries) {
    const countryData = [];
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][country];
      countryData.push({ year: Number(year), value: Number(yearData) });
    }
    dataset.push(countryData);
  }

  const flatData = dataset.reduce((acc, d) => acc.concat(d), []);
  const getDomain = (dataset, func) => [d3.min(dataset, func), d3.max(dataset, func)];

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

  group.selectAll('.dots').remove();
  group.selectAll('.line').remove();
  group.select('.xAxis').remove();
  group.select('.yAxis').remove();

  // CREATE NEW ELEMENTS

  group.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  group.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  for (let i = 0; i < dataset.length; i++) {
    const num = 6;
    const color = d3.schemeRdYlGn[num][i % num];

    group.append('path')
      .datum(dataset[i])
      .attr('stroke', color)
      .attr('class', 'line')
      .attr('d', line);

    group.append('g')
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
