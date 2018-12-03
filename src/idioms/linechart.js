import * as d3 from 'd3';
import { createSVG } from '../helpers';

const margin = { top: 50, right: 50, bottom: 50, left: 100 };
let linesSVG;

export function drawLines(id, widthMain, heightMain, data, countries = ['PRT']) {
  const
    width = widthMain - margin.left - margin.right,
    height = heightMain - margin.top - margin.bottom;

  linesSVG = createSVG(id, { width, height }, margin);

  const group = linesSVG
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  let dataset = [];
  for (let country in countries) {
    for (let year in data) {
      const yearData = data[year]['WORLD'][country];
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

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

  group.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

  group.append('g')
    .attr('class', 'yAxis')
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

export function updateLineChart(group, data) {
  const
    width = linesSVG.attr('width') - margin.left - margin.right,
    height = linesSVG.attr('height') - margin.top - margin.bottom;

  let dataset = [];
  if (selectedCountry) {
    for (let year in dataYears) {
      const yearData = dataYears[year]['WORLD'][selectedCountry];
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

  group.select('.yAxis').call(d3.axisLeft(yScale));

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

export function createLineChart(id, width = 600, height = 400) {
  const group = createSVG(id, { width, height }, margin);

  const
    width2 = width - margin.left - margin.right,
    height2 = height - margin.top - margin.bottom;

  console.log('GOT HERE');

  group.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height2})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')));

  group.append('g')
    .attr('class', 'yAxis')
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

  return group;
}
