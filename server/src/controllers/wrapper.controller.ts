import { NextFunction, Request, Response } from "express";

type ExpressRouteHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T> | T;

export function controllerWrapper<T>(routeHandler: ExpressRouteHandler<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routeHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}