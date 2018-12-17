import React from 'react';
import Slider from 'rc-slider';
import { stateEmitter, selection, years } from '../util';

import 'rc-slider/assets/index.css';
import './YearSlider.css';

const marks = {};
years.forEach(year => marks[year] = year + '');

function yearChange(params) {
  selection.setYear(params);
}

export default class YearSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    stateEmitter.on('yearChanged', () => {
      const year = selection.getYear();
      this.setState({ year });
    });
  }
  render() {
    const style = { padding: '0.4em 2em 0' };

    return (
      <div style={style}>
        <Slider
          value={this.state.year}
          min={1995}
          max={2017}
          included={false}
          marks={marks}
          step={null}
          onChange={yearChange}
          defaultValue={2010}
          handleStyle={{ border: 'white', backgroundColor: 'silver' }} />
      </div>
    );
  }
}
