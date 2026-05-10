import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update the request with the validated (and potentially transformed/sanitized) data
      req.body = validatedData.body;
      req.query = validatedData.query;
      req.params = validatedData.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      return next(error);
    }
  };
};
