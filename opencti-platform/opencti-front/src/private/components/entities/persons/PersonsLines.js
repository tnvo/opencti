import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { pathOr, propOr } from 'ramda';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import { PersonLine, PersonLineDummy } from './PersonLine';

const nbOfRowsToLoad = 25;

class PersonsLines extends Component {
  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      paginationOptions,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr([], ['users', 'edges'], this.props.data)}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['users', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={<PersonLine />}
        DummyLineComponent={<PersonLineDummy />}
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        me={propOr(null, 'me', this.props.data)}
      />
    );
  }
}

PersonsLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  data: PropTypes.object,
  relay: PropTypes.object,
  users: PropTypes.object,
  initialLoading: PropTypes.bool,
};

export const personsLinesQuery = graphql`
  query PersonsLinesPaginationQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: UsersOrdering
    $orderMode: OrderingMode
  ) {
    ...PersonsLines_data
      @arguments(
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  PersonsLines,
  {
    data: graphql`
      fragment PersonsLines_data on Query
        @argumentDefinitions(
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: { type: "UsersOrdering", defaultValue: "name" }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        users(
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_users") {
          edges {
            node {
              id
              name
              description
              ...PersonLine_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
        me {
          ...PersonLine_me
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.users;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: personsLinesQuery,
  },
);
