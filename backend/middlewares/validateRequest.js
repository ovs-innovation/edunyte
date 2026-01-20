/**
 * Middleware to validate request body using Zod schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema || typeof schema.parse !== 'function') {
        return res.status(500).json({ 
          message: "Invalid validation schema" 
        });
      }
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error && error.issues && Array.isArray(error.issues)) {
        const messages = error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        }).join(", ");
        return res.status(400).json({ 
          message: `Validation error: ${messages}`,
          errors: error.issues 
        });
      }
      return res.status(400).json({ 
        message: "Validation error",
        error: error?.message || "Unknown validation error"
      });
    }
  };
};

