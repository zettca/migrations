import React from 'react';
import store from 'store';
import Switch from 'react-switch';

import { map } from '../idioms';

export default class MigrationSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const { checked } = this.state;
    store.set('isEmigration', checked);
  }

  handleChange(checked) {
    store.set('isEmigration', checked);
    this.setState({ checked });

    map.update(); // map updates others
  }

  render() {
    const { checked } = this.state;

    return (
      <div>
        <Switch
          onChange={this.handleChange}
          checked={checked}
          onColor="#86d3ff"
          onHandleColor="#2693e6"
          handleDiameter={24}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={16}
          width={64}
          id={'mySwitcherino'}
        />
        <span>{checked ? 'Emigration' : 'Immigration'}</span>
      </div>
    );
  }
}
