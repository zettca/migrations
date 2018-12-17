import * as d3 from 'd3';
import store from 'store';
import { createSVG, colors, numColors, countryName, parseNaN, getMigration } from '../helpers';

export default {
  draw: drawGraph,
  update: updateGraph,
};

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

let graphSVG;
let svgDims;
let selectedCountries;
let compareData, migrationData, populationData;

const metrics = [
  'GDP per capita',
  'Social support',
  'Healthy life expectancy',
  'Freedom to make life choices',
  'Perceptions of corruption',
  // 'Confidence in government',
];

function loadDataset() {
  const dataset = {};
  if (!selectedCountries || selectedCountries.length === 0) return [];

  for (let c of selectedCountries) {
    const country = [];
    for (let year in migrationData) {
      const dataYear = migrationData[year];
      if (dataYear[c] === undefined) continue; // no data

      const migrants = Number(getMigration(dataYear, c));
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
      dataset[entry.country] = [];
    }
    dataset[entry.country].push(parseNaN(entry));
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

  selectedCountries = store.get('selectedCountries');

  const dataset = loadDataset();
  const compareDataset = loadCompareDataset();

  const flatData = Object.values(dataset).reduce((acc, d) => acc.concat(d), []);

  const axisDomain = (data, fn) => [d3.min(data, fn), d3.max(data, fn)];

  const yearScale = d3.scaleLinear()
    .domain(axisDomain(flatData, d => d.year)).nice()
    .range([0, width]);

  const migrantsScale = d3.scaleLinear()
    .domain(axisDomain(flatData, d => d.value)).nice()
    .range([height, 0]);

  // scale for each metric
  const metricsScale = metrics.map(metric =>
    d3.scaleLinear()
      .domain(axisDomain(compareData, d => +d[metric])).nice()
      .range([height, 0]));

  const xAxis = d3.axisBottom(yearScale).tickFormat(d3.format('d'));
  const yAxis1 = d3.axisLeft(migrantsScale).tickFormat(d3.format('~s'));
  //const yAxis2 = d3.axisRight(yScale2).tickFormat(d3.format('~s'));

  const line = d3.line()
    .x(d => yearScale(d.year))
    .y(d => migrantsScale(d.value))
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

  const ms = store.get('isEmigration') ? 'emigration' : 'immigration';

  const countriesGroup = graphSVG.append('g')
    .attr('class', 'countries');

  function showMetrics(g) {
    countriesGroup.attr('visibility', 'hidden');
    g.attr('visibility', 'visible');
    g.selectAll('.selected').classed('selected', false);
    g.selectAll('.metrics').classed('selected', true);
  }

  function hideMetrics(g) {
    d3.event.preventDefault();
    countriesGroup.attr('visibility', 'visible');
    g.attr('visibility', null);
    g.selectAll('.selected').classed('selected', false);
    g.selectAll('.metrics').attr('visibility', 'hidden');
  }

  let i = 0;
  for (const country in dataset) {
    const countryData = dataset[country];
    const color = colors.selection[i++ % numColors];
    const coName = countryName(country);

    if (!countryData) break;

    const countryGroup = countriesGroup.append('g')
      .attr('id', country)
      .attr('class', 'country')
      .attr('name', coName);

    countryGroup.append('path')  // line
      .datum(countryData)
      .attr('class', 'line')
      .attr('stroke', color)
      .attr('d', line)
      .on('click', () => showMetrics(countryGroup))
      .on('contextmenu', () => hideMetrics(countryGroup))
      .on('mouseenter', () => countryGroup.selectAll('.metrics').attr('visibility', 'visible'))
      .on('mouseout', () => countryGroup.selectAll('.metrics').attr('visibility', 'hidden'))
      .append('title').text(() => `${coName} ${ms} line`);

    countryGroup.append('g')    // line dots
      .attr('class', 'dots')
      .attr('fill', color)
      .attr('stroke', color)
      .selectAll().data(countryData)
      .enter().append('circle')
      .attr('cx', (d) => yearScale(d.year))
      .attr('cy', (d) => migrantsScale(d.value))
      .attr('r', 3)
      .append('title').text(d => `${coName} (${d.year}): ${d3.format('~s')(d.value)}`);

    // correlation data

    if (!compareDataset[country]) break;

    const metricsGroup = countryGroup.append('g')
      .attr('class', 'metrics')
      .attr('visibility', 'hidden');

    metrics.forEach((met, i) => {
      const color = d3.interpolateRainbow(i / metrics.length);

      const line = d3.line()
        .x(d => yearScale(d.year))
        .y(d => metricsScale[i](d[met]))
        .defined(d => d[met])
        .curve(d3.curveMonotoneX);

      const metricGroup = metricsGroup.append('g')
        .attr('class', 'metric');

      metricGroup.append('path')  // line
        .datum(compareDataset[country])
        .attr('stroke', color)
        .attr('fill', 'none')
        .attr('opacity', 0.8)
        .attr('d', line)
        .append('title').text(() => met);

      metricGroup.append('g')    // correlation circles
        .attr('fill', color)
        .attr('stroke', color)
        .selectAll('circle')
        .data(compareDataset[country])
        .enter().append('circle')
        .attr('class', 'circle')
        .attr('cx', d => yearScale(d.year))
        .attr('cy', d => metricsScale[i](d[met]))
        .attr('r', d => d[met] === '' ? 0 : 3)
        .append('title').text(d => `${coName} (${d.year}): ${d[met]} ${met}`);
    });
  }
}
