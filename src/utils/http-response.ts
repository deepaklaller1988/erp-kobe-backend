import { Response } from "express";
import errors from "./http-error.conf";

export default {
  sendSuccess: (res: Response, data: object, statusCode: number = 200) => {
    res.status(statusCode).json({ success: true, data, error: null });
  },

  sendPaginationSuccess: (res: Response, data: object, count: any = 0, statusCode: number = 200) => {
    res.status(statusCode).json({ success: true, data, count, error: null });
  },
  sendError: (res: Response, error: string, data: object | null = null) => {

    if (!errors[error]) {
      error = error ? error : "ERR_INTERNAL_SERVER_ERROR";
    }
    res.errorMessage = error;
    res
      .status(errors[error] ? errors[error].statusCode : 400)
      .json({ success: false, data: data, error: { code: error } });
  },
};  
