import * as d3 from 'd3';
import store from 'store';
import { createSVG } from '../helpers';

export default {
  draw: drawPlot,
  update: updatePlot,
};

const margin = { top: 10, right: 20, bottom: 20, left: 40 };

let plotSVG;
let svgDims;
let compareData;

export function drawPlot(id, data) {
  const el = document.querySelector(id);
  svgDims = { width: el.clientWidth, height: el.clientHeight };
  plotSVG = createSVG(id, svgDims, margin);

  compareData = data;

  updatePlot();
}

export function updatePlot() {
  console.log('updating plot...');

  const selectedCountries = store.get('selectedCountries');
  const country = selectedCountries[0];
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

  const countryData = Object.values(compareData[country] || []);
  console.log(countryData);

  const
    width = svgDims.width - margin.left - margin.right,
    height = svgDims.height - margin.top - margin.bottom;

  const flatData = countryData.reduce((acc, d) => acc.concat(d), []);
  const getDomain = (dataset, fn) => [d3.min(dataset, fn), d3.max(dataset, fn)];

  const xScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d.year)).nice()
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain(getDomain(flatData, d => d[metric])).nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.format('~s'));

  // CLEAR OLD ELEMENTS

  plotSVG.selectAll('.circle').remove();
  plotSVG.selectAll('.xAxis').remove();
  plotSVG.selectAll('.yAxis').remove();

  // CREATE NEW ELEMENTS

  plotSVG.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis);

  plotSVG.append('g')
    .attr('class', 'yAxis')
    .call(yAxis);

  plotSVG.append('g')
    .attr('class', 'circles')
    .selectAll('circle')
    .data(countryData)
    .enter().append('circle')
    .attr('class', 'circle')
    .attr('cx', d => xScale(d.year))
    .attr('cy', d => yScale(d[metric]))
    .attr('r', 4);
}
