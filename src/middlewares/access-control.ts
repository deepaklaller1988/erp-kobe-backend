import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/handleToken";
import { AuthenticatedRequest } from "../types/middlewareTypes";

const accessControl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.header("authorization")?.replace("Bearer ", "");
  if (!authToken) {
    return res.sendError(res, "ERR_ACCESS_TOKEN_MISSING");
  }
  const { decoded, error }: any = await verifyToken(authToken, "access");
  if (error) {
    switch (error.name) {
      case "JsonWebTokenError":
        return res.sendError(res, "ERR_INVALID_ACCESS_TOKEN");
      case "TokenExpiredError":
        return res.sendError(res, "ERR_ACCESS_TOKEN_EXPIRED");
      default:
        return res.sendError(res, "ERR_INVALID_ACCESS_TOKEN");
    }
  }
  req.userId = decoded.userId;
  next();
};

export default accessControl;