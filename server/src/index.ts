import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { __prod__, COOKIE_NAME } from './constants'
import { MyContext } from './types'
import cors from 'cors'
import { createConnection } from 'typeorm'
import { createUserLoader } from './utils/createUserLoader'
import { createUpvoteLoader } from './utils/createUpvoteLoader'

const PORT = process.env.PORT || 4000

const main = async (): Promise<void> => {
  const conn = await createConnection()
  await conn.runMigrations()
  const app = express()

  const RedisStore = connectRedis(session)
  const redis = new Redis()

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        secure: __prod__,
        sameSite: 'lax',
      },
      saveUninitialized: false,
      secret: 'vbraiubuibiubaiubciuebiubuacbejikb',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
  })
  apolloServer.applyMiddleware({
    app,
    cors: false,
  })
  app.listen(PORT, () => console.log(`Server started at port: ${PORT}`))
}

try {
  main()
} catch (e) {
  console.log(e)
}
