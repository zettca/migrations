import React from 'react';
import store from 'store';
import Switch from 'react-switch';

import { selection } from '../helpers';

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
    this.setState({ checked });
    selection.setMigration(checked);
  }

  render() {
    const { checked } = this.state;

    return (
      <div>
        <Switch
          onChange={this.handleChange}
          checked={checked}
          onColor="#FFAB91"
          offColor="#FFAB91"
          onHandleColor="#FF8A65"
          offHandleColor="#FF8A65"
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
