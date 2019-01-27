import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import inject18n from '../../../components/i18n';
import EntityStixRelations from '../stix_relation/EntityStixRelations';
import StixDomainEntityKnowledge from '../stix_domain_entity/StixDomainEntityKnowledge';
import StixRelation from '../stix_relation/StixRelation';
import IntrusionSetHeader from './IntrusionSetHeader';
import IntrusionSetKnowledgeBar from './IntrusionSetKnowledgeBar';

const styles = () => ({
  container: {
    margin: 0,
  },
  content: {
    paddingRight: 260,
  },
});

const inversedRelations = ['campaign', 'incident', 'intrusion-set'];

class IntrusionSetKnowledgeComponent extends Component {
  render() {
    const { classes, intrusionSet, location } = this.props;
    const link = `/dashboard/knowledge/intrusionSets/${intrusionSet.id}/knowledge`;
    return (
      <div className={classes.container}>
        <IntrusionSetHeader intrusionSet={intrusionSet} variant='noalias'/>
        <IntrusionSetKnowledgeBar intrusionSetId={intrusionSet.id}/>
        <div className={classes.content}>
          <Route exact path='/dashboard/knowledge/intrusionSets/:intrusionSetId/knowledge/relations/:relationId' render={
            routeProps => <StixRelation entityId={intrusionSet.id} {...routeProps} inversedRelations={inversedRelations}/>
          }/>
          {location.pathname.includes('overview') ? <StixDomainEntityKnowledge stixDomainEntityId={intrusionSet.id}/> : ''}
          {location.pathname.includes('attribution') ? <EntityStixRelations entityId={intrusionSet.id} relationType='uses' targetEntityType='Intrusion-Set' entityLink={link}/> : ''}
          {location.pathname.includes('campaigns') ? <EntityStixRelations entityId={intrusionSet.id} relationType='uses' targetEntityType='Campaign' entityLink={link}/> : ''}
          {location.pathname.includes('incidents') ? <EntityStixRelations entityId={intrusionSet.id} relationType='uses' targetEntityType='Incident' entityLink={link}/> : ''}
          {location.pathname.includes('victimology') ? <EntityStixRelations entityId={intrusionSet.id} relationType='targets' targetEntityType='Identity' entityLink={link}/> : ''}
          {location.pathname.includes('ttp') ? <EntityStixRelations entityId={intrusionSet.id} relationType='uses' targetEntityType='Attack-Pattern' entityLink={link}/> : ''}
          {location.pathname.includes('tools') ? <EntityStixRelations entityId={intrusionSet.id} relationType='uses' targetEntityType='Tool' entityLink={link}/> : ''}
          {location.pathname.includes('vulnerabilities') ? <EntityStixRelations entityId={intrusionSet.id} relationType='targets' targetEntityType='Vulnerability' entityLink={link}/> : ''}
        </div>
      </div>
    );
  }
}

IntrusionSetKnowledgeComponent.propTypes = {
  intrusionSet: PropTypes.object,
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
};

const IntrusionSetKnowledge = createFragmentContainer(IntrusionSetKnowledgeComponent, {
  intrusionSet: graphql`
      fragment IntrusionSetKnowledge_intrusionSet on IntrusionSet {
          id
          ...IntrusionSetHeader_intrusionSet
      }
  `,
});

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(IntrusionSetKnowledge);