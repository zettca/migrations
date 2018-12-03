import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';

export default {
  draw: drawLines,
  update: updateLines,
};

let linesSVG;
let dataYears;

export function drawLines(id, width, height, data) {
  const
    margin = { top: 50, right: 50, bottom: 50, left: 60 },
    width2 = width - margin.left - margin.right,
    height2 = height - margin.top - margin.bottom;

  linesSVG = createSVG(id, { width, height });

  const group = linesSVG
    // .attr('width', width + margin.left + margin.right)
    // .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  dataYears = data;

  let dataset = [];
  const countryID = store.get('selectedCountry');
  if (countryID) {
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][countryID];
      dataset.push({ year: new Date(year), value: Number(yearData) });
    }
  }
  console.log(dataset);

  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]).nice()
    .range([0, width2]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)]).nice()
    .range([height2, 0]);

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  group.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height2})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

  group.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale));

  group.append('path')
    .datum(dataset)
    .attr('class', 'line')
    .attr('d', line);

  group.append('g').attr('class', 'dots').selectAll()
    .data(dataset)
    .enter().append('circle')
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 5);
}

export function updateLines() {
  const group = linesSVG.selectAll('g');

  const
    margin = { top: 50, right: 50, bottom: 50, left: 100 },
    width = linesSVG.attr('width') - margin.left - margin.right,
    height = linesSVG.attr('height') - margin.top - margin.bottom;

  let dataset = [];

  const countryID = store.get('selectedCountry');
  if (countryID) {
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][countryID];
      dataset.push({ year: new Date(year), value: Number(yearData) });
    }
  }
  console.log(dataset);

  const xScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)]).nice()
    .range([height, 0]);

  group.select('.y-axis').call(d3.axisLeft(yScale));

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  group.select('.line')
    .datum(dataset)
    .transition().duration(1000)
    .attr('d', line);

  group.selectAll('.dots circle').data(dataset)
    .transition().duration(1000)
    .attr('cx', (d) => xScale(d.year))
    .attr('cy', (d) => yScale(d.value))
    .attr('r', 5);
}
