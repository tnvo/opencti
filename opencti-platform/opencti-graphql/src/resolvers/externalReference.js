import { withFilter } from 'graphql-subscriptions';
import { BUS_TOPICS } from '../config/conf';
import {
  addExternalReference,
  externalReferenceDelete,
  findAll,
  findByEntity,
  findById,
  search,
  externalReferenceEditContext,
  externalReferenceEditField,
  externalReferenceAddRelation,
  externalReferenceDeleteRelation,
  externalReferenceCleanContext
} from '../domain/externalReference';
import { fetchEditContext, pubsub } from '../database/redis';
import withCancel from '../schema/subscriptionWrapper';

const externalReferenceResolvers = {
  Query: {
    externalReference: (_, { id }) => findById(id),
    externalReferences: (_, args) => {
      if (args.objectId && args.objectId.length > 0) {
        return findByEntity(args);
      }
      return findAll(args);
    }
  },
  ExternalReference: {
    editContext: externalReference => fetchEditContext(externalReference.id)
  },
  Mutation: {
    externalReferenceEdit: (_, { id }, { user }) => ({
      delete: () => externalReferenceDelete(id),
      fieldPatch: ({ input }) => externalReferenceEditField(user, id, input),
      contextPatch: ({ input }) =>
        externalReferenceEditContext(user, id, input),
      contextClean: () => externalReferenceCleanContext(user, id),
      relationAdd: ({ input }) => externalReferenceAddRelation(user, id, input),
      relationDelete: ({ relationId }) =>
        externalReferenceDeleteRelation(user, id, relationId)
    }),
    externalReferenceAdd: (_, { input }, { user }) =>
      addExternalReference(user, input)
  },
  Subscription: {
    externalReference: {
      resolve: payload => payload.instance,
      subscribe: (_, { id }, { user }) => {
        externalReferenceEditContext(user, id);
        const filtering = withFilter(
          () => pubsub.asyncIterator(BUS_TOPICS.ExternalReference.EDIT_TOPIC),
          payload => {
            if (!payload) return false; // When disconnect, an empty payload is dispatched.
            return payload.user.id !== user.id && payload.instance.id === id;
          }
        )(_, { id }, { user });
        return withCancel(filtering, () => {
          externalReferenceCleanContext(user, id);
        });
      }
    }
  }
};

export default externalReferenceResolvers;
