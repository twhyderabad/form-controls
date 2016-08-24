import React, { Component, PropTypes } from 'react';
import 'src/helpers/componentStore';
import { getControls } from 'src/helpers/controlsParser';

export class Section extends Component {

  constructor(props) {
    super(props);
    this.childControls = {};
    this.getValue = this.getValue.bind(this);
    this.storeChildRef = this.storeChildRef.bind(this);
  }

  getValue() {
    const observations = [];
    for(const key in this.childControls) {
      if(this.childControls.hasOwnProperty(key)) {
        observations.push(this.childControls[key].getValue());
      }
    }
    return observations.filter(obs => obs !== undefined);
  }

  storeChildRef(ref) {
    if(ref) this.childControls[ref.props.metadata.id] = ref;
  }

  render() {
    const { formUuid, metadata: { controls, value }, obs } = this.props;
    const childProps = { formUuid, ref: this.storeChildRef };
    return (
      <fieldset>
        <legend>{value}</legend>
        <div className="section-controls">{getControls(controls, obs, childProps)}</div>
      </fieldset>
    );
  }
}

Section.propTypes = {
  formUuid: PropTypes.string.isRequired,
  metadata: PropTypes.shape({
    controls: PropTypes.array.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      visualOnly: PropTypes.bool.isRequired,
    }),
  }),
  obs: PropTypes.array,
};

window.componentStore.registerComponent('section', Section);
