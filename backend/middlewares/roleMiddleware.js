export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ 
      error: "Access denied. Admin privileges required." 
    });
  }
  next();
};

export const isTeacher = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ 
      error: "Access denied. Teacher privileges required." 
    });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ 
      error: "Access denied. Student privileges required." 
    });
  }
  next();
};
