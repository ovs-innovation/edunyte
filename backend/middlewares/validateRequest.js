/**
 * Middleware to validate request body using Zod schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.issues) {
        const messages = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        }).join(", ");
        return res.status(400).json({ message: `Validation error: ${messages}` });
      }
      return res.status(400).json({ message: "Validation error" });
    }
  };
};

