import * as d3 from 'd3';
import store from 'store';
import { createSVG, colors, numColors, countryName, parseNaN } from '../helpers';

export default {
  draw: drawGraph,
  update: updateGraph,
};

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

let graphSVG;
let svgDims;
let compareData;
let migrationData;
let populationData;
let selectedCountries;

const metrics = [
  'GDP per capita',
  'Confidence in government',
  'Freedom to make life choices',
  'Generosity',
  'Healthy life expectancy',
  'Life Ladder',
  'Perceptions of corruption',
  'Social support',
];
const metric = metrics[0];

function loadDataset() {
  const dataset = {};
  selectedCountries = store.get('selectedCountries');
  if (!selectedCountries || selectedCountries.length === 0) return [];

  const isEmigration = store.get('isEmigration');

  for (let c of selectedCountries) {
    const country = [];
    for (let year in migrationData) {
      const dataYear = migrationData[year];
      if (dataYear[c] === undefined) continue; // no data

      const migrants = Number(isEmigration ? dataYear['WORLD'][c] : dataYear[c]['Total']);
      const pop = populationData[c][year] * 1000;
      const data = migrants /*/ pop*/;

      country.push({ year: Number(year), value: Number(data) });
    }
    dataset[c] = country;
  }

  return dataset;
}

function loadCompareDataset() {
  const dataset = {};
  compareData.forEach(entry => {
    if (dataset[entry.country] === undefined) {
      dataset[entry.country] = {};
    }
    dataset[entry.country][entry.year] = parseNaN(entry);
  });
  return dataset;
}

export function drawGraph(id, data, whrData, pop) {
  const el = document.querySelector(id);
  svgDims = { width: el.clientWidth, height: el.clientHeight };


  graphSVG = createSVG(id, svgDims, margin);
  migrationData = data;
  populationData = pop;
  compareData = whrData;

  updateGraph();
}

export function updateGraph() {
  console.log('updating graph...');

  const
    width = svgDims.width - margin.left - margin.right,
    height = svgDims.height - margin.top - margin.bottom;

  const data = loadDataset();
  const dataset = Object.values(data);
  const compareDataset = loadCompareDataset();

  const flatData = dataset.reduce((acc, d) => acc.concat(d), []);
  const filterData = compareData.filter(el => selectedCountries.includes(el.country));
  const xDomain = (data, fn) => [d3.min(data, fn), d3.max(data, fn)];
  const y1Domain = (data, fn) => [Math.min(0, d3.min(data, fn)), d3.max(data, fn)];
  const y2Domain = (data, fn) => [d3.min(data, fn), d3.max(data, fn)];

  const xScale = d3.scaleLinear()
    .domain(xDomain(flatData, d => d.year)).nice()
    .range([0, width]);

  const yScale1 = d3.scaleLinear()
    .domain(y1Domain(flatData, d => d.value)).nice()
    .range([height, 0]);

  const yScale2 = d3.scaleLinear()
    .domain(y2Domain(filterData, d => +d[metric])).nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'));
  const yAxis1 = d3.axisLeft(yScale1)
    .tickFormat(d3.format('~s'));
  const yAxis2 = d3.axisRight(yScale2)
    .tickFormat(d3.format('~s'));

  const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale1(d.value))
    .curve(d3.curveMonotoneX);

  // CLEAR OLD ELEMENTS

  graphSVG.selectAll('.country').remove();
  graphSVG.selectAll('.xAxis').remove();
  graphSVG.selectAll('.yAxis').remove();

  // CREATE NEW ELEMENTS

  graphSVG.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  graphSVG.append('g')
    .attr('class', 'yAxis')
    .call(yAxis1);

  // graphSVG.append('g')
  //   .attr('class', 'yAxis')
  //   .attr('transform', `translate(${width},${0})`)
  //   .call(yAxis2);

  for (let i = 0; i < dataset.length; i++) {
    const color = colors.selection[i % numColors];
    const name = countryName(selectedCountries[i]);

    const countryGroup = graphSVG.append('g')
      .attr('class', 'country')
      .attr('name', name);

    countryGroup.append('path')  // line
      .datum(dataset[i])
      .attr('stroke', color)
      .attr('class', 'line')
      .attr('d', line);

    countryGroup.append('g')    // line dots
      .attr('class', 'dots')
      .attr('fill', color)
      .attr('stroke', color)
      .selectAll().data(dataset[i])
      .enter().append('circle')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScale1(d.value))
      .attr('r', 3)
      .append('title').text(d => `${name} (${d.year}): ${d3.format('~s')(d.value)}`);

    countryGroup.append('g')    // correlation circles
      .attr('class', 'circles')
      .selectAll('circle')
      .data(Object.values(compareDataset[selectedCountries[i]]))
      .enter().append('circle')
      .attr('class', 'circle')
      .attr('fill', color)
      .attr('stroke', color)
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale2(d[metric]))
      .attr('r', 5)
      .append('title').text(d => `${name} (${d.year}): ${d[metric]} ${metric}`);
  }
}
