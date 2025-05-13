import { Router } from 'express';
import { healthCheckCtrl } from '@controller/health.controller';

export const health = (router: Router): void => {
  router.get('/', healthCheckCtrl);
};
