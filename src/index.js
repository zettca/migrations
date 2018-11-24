/*
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
*/

import './index.css';

import * as d3 from 'd3';
import { mesh } from 'topojson';
import { tsv, json } from 'd3-fetch';

const K = 1000, M = 1000000;

const
  margin = { top: 20, right: 20, bottom: 30, left: 30 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const color = d3.scaleThreshold()
  .domain([10 * K, 100 * K, 500 * K, 1 * M, 5 * M, 10 * M, 50 * M, 100 * M, 500 * M, 1500 * M])
  .range(['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)', 'rgb(3,19,43)']);

const svg = d3.selectAll('#choropleth')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map');

const projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

Promise.all([
  json('./data/countries.json'),
  tsv('./data/population.tsv')
]).then((dataResults) => {
  const [countries, population] = dataResults;
  handleData(countries, population);
});


function handleData(data, population) {
  const populationById = {};

  population.forEach(function (d) { populationById[d.id] = +d.population; });

  svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(data.features)
    .enter().append('path')
    .attr('d', path)
    .style('fill', (d) => color(populationById[d.id]))
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style('opacity', 0.8)
    // tooltips
    .style('stroke', 'white')
    .style('stroke-width', 0.3);

  svg.append('path')
    .datum(mesh(data.features, (a, b) => a.id !== b.id))
    //.datum(mesh(data.features, a, b) => a !== b))
    .attr('class', 'names')
    .attr('d', path);
}
