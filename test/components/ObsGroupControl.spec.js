import React, { Component, PropTypes } from 'react';
import { mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai, { expect } from 'chai';
import { ObsGroupControl } from 'components/ObsGroupControl.jsx';
import sinon from 'sinon';
import { Obs } from 'src/helpers/Obs';
import { AbnormalObsGroupMapper } from 'src/mapper/AbnormalObsGroupMapper';
import { ObsGroupMapper } from 'src/mapper/ObsGroupMapper';
import ComponentStore from 'src/helpers/componentStore';


chai.use(chaiEnzyme());

function getLocationProperties(row, column) {
  return { location: { row, column } };
}

class DummyControl extends Component {
  getValue() {
    return { uuid: this.props.formUuid };
  }

  render() {
    return (<div>{ this.props.formUuid }</div>);
  }
}

DummyControl.propTypes = {
  formUuid: PropTypes.string,
};

describe('ObsGroupControl', () => {
  before(() => {
    ComponentStore.registerComponent('randomType', DummyControl);
  });

  after(() => {
    ComponentStore.deRegisterComponent('randomType');
  });

  const formUuid = 'formUuid';
  const obsGroupConcept = {
    uuid: '70645842-be6a-4974-8d5f-45b52990e132',
    name: 'Pulse Data',
    datatype: 'N/A',
  };

  const metadata = {
    id: '1',
    type: 'obsGroupControl',
    concept: obsGroupConcept,
    properties: getLocationProperties(0, 0),
    label: {
      type: 'label',
      value: 'label',
    },
    controls: [
      {
        id: '100',
        type: 'randomType',
        properties: getLocationProperties(0, 1),
      },
      {
        id: '101',
        type: 'randomType',
        properties: getLocationProperties(0, 2),
      },
      {
        id: '102',
        type: 'randomType',
        properties: getLocationProperties(1, 0),
      },
    ],
  };
  const onChangeSpy = sinon.spy();
  const observation = new Obs({
    concept: obsGroupConcept,
    groupMembers: [],
  });

  describe('render', () => {
    it('should render obsGroup control with observations', () => {
      const wrapper = mount(
        <ObsGroupControl
          formUuid={formUuid}
          metadata={metadata}
          obs={observation}
          onValueChanged={onChangeSpy}
          validate={false}
        />);

      expect(wrapper.find('legend').text()).to.eql(obsGroupConcept.name);
      expect(wrapper).to.have.exactly(3).descendants('DummyControl');
    });


    it('should render obsGroup control with only the registered controls', () => {
      ComponentStore.deRegisterComponent('randomType');
      const wrapper = mount(
        <ObsGroupControl
          formUuid={formUuid}
          metadata={metadata}
          obs={observation}
          onValueChanged={onChangeSpy}
          validate={false}
        />);

      expect(wrapper).to.not.have.descendants('DummyControl');
      ComponentStore.registerComponent('randomType', DummyControl);
    });

    it('should invoke the corresponding mapper based on metadata property', () => {
      metadata.properties.isAbnormal = true;
      const wrapper = mount(
        <ObsGroupControl
          formUuid={formUuid}
          metadata={metadata}
          obs={observation}
          onValueChanged={onChangeSpy}
          validate={false}
        />);

      const instance = wrapper.instance();
      expect(instance.mapper instanceof AbnormalObsGroupMapper).to.deep.equal(true);
    });

    it('should trigger onChange in obsGroup if its child obs has changed', () => {
      const pulseNumericConcept = {
        name: 'Pulse',
        uuid: 'pulseUuid',
        datatype: 'Numeric',
        conceptClass: 'Misc',
      };

      const metadataUpdated = {
        id: '1',
        type: 'obsGroupControl',
        concept: obsGroupConcept,
        properties: getLocationProperties(0, 0),
        label: {
          type: 'label',
          value: 'label',
        },
        controls: [
          {
            id: '100',
            type: 'randomType',
            concept: pulseNumericConcept,
            properties: getLocationProperties(0, 1),
          },
        ],
      };

      const pulseNumericObs = new Obs({
        concept: pulseNumericConcept,
        value: 10, formNamespace: 'formUuid/100', uuid: 'childObs1Uuid',
      });

      const pulseDataObs = new Obs({
        concept: {
          name: 'Pulse Data',
          uuid: 'pulseDataUuid',
          datatype: 'Misc',
        },
        groupMembers: [
          {
            concept: pulseNumericConcept,
            value: 10, formNamespace: 'formUuid/100', uuid: 'childObs1Uuid',
          }],
        formNamespace: 'formUuid/1', uuid: 'pulseDataObsUuid',
      });

      const wrapper = mount(
        <ObsGroupControl
          formUuid={formUuid}
          metadata={metadataUpdated}
          obs={pulseDataObs}
          onValueChanged={onChangeSpy}
          validate={false}
        />);
      const pulseNumericUpdated = pulseNumericObs.setValue(20);
      const instance = wrapper.instance();
      instance.onChange(pulseNumericUpdated, []);
      const updatedObs = instance.mapper.setValue(instance.state.obs, pulseNumericUpdated, []);
      sinon.assert.calledOnce(
        onChangeSpy.withArgs(updatedObs, []));
    });

    it('should have obsGroupMapper if metadata does not have isAbnormal property', () => {
      metadata.properties.isAbnormal = false;
      const wrapper = mount(
        <ObsGroupControl
          formUuid={formUuid}
          metadata={metadata}
          obs={observation}
          onValueChanged={onChangeSpy}
          validate={false}
        />);

      const instance = wrapper.instance();
      expect(instance.mapper instanceof ObsGroupMapper).to.deep.equal(true);
    });
  });
});
