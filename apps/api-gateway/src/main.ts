import fastify from 'fastify';
import { gql } from 'graphql-tag';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';

export default async function buildApp() {
  const app = fastify({
    logger: true,
  });

  // Simple REST endpoint still works
  app.get('/', async () => {
    return { message: 'API Gateway Online 🚀' };
  });

  // ----------------------------------------------------------
  //  GRAPHQL SETUP (per Nx guide)
  // ----------------------------------------------------------

  // Schema
  const typeDefs = gql`
    type Query {
      hello: String
    }
  `;

  // Resolvers
  const resolvers = {
    Query: {
      hello: () => 'Hello from Apollo + Fastify + Nx!',
    },
  };

  // Apollo Server
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await apollo.start();

  // Register Apollo middleware
  app.register(fastifyApollo(apollo), {
    path: '/graphql',
  });

  return app;
}
// ----------------------------------------------------------
//  BOOTSTRAP SERVER (this is what you were missing)
// ----------------------------------------------------------

async function start() {
  const app = await buildApp();

  await app.listen({ port: 3000, host: '0.0.0.0' });
  console.log(`🚀 API Gateway running at http://localhost:3000`);
}

start();