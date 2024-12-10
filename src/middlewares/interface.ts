import { Response, Request, NextFunction } from "express";
import httpresponse from "../utils/http-response";

declare global {
  namespace Express {
    interface Response {
      sendSuccess: typeof httpresponse.sendSuccess;
      sendPaginationSuccess: typeof httpresponse.sendPaginationSuccess;
      sendError: typeof httpresponse.sendError;
    }
  }
}

const setInterfaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendSuccess = httpresponse.sendSuccess;
  res.sendPaginationSuccess = httpresponse.sendPaginationSuccess;
  res.sendError = httpresponse.sendError;
  next();
};

export default setInterfaces;