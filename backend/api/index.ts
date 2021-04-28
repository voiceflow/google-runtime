import express from 'express';

import { ControllerMap, MiddlewareMap } from '@/lib';

import GoogleRouter from './routers/google';

export default (middlewares: MiddlewareMap, controllers: ControllerMap) => {
  const router = express.Router();

  router.get('/health', (_, res) => res.send(`${process.env.NODE_ENV} Healthy`));
  router.use('/', GoogleRouter(middlewares, controllers));

  return router;
};
