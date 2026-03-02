import { ZodType, z } from "zod";
import { Request, Response, NextFunction } from "express";

export interface ValidatedRequest<Q = any> extends Request {
  validatedQuery?: Q;
}

export const validate =
  (schema: ZodType, source: "body" | "query" | "params") =>
  (req: ValidatedRequest, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const treeErrors = z.treeifyError(result.error);

      return res.status(400).json({
        message: "Validation error",
        errors: treeErrors,
      });
    }
     if (source === "query") {
        req.validatedQuery = result.data;
     } else {
       req[source] = result.data;
     }
    next();
  };