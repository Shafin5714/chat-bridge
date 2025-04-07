const asyncHandler = (fn) => (req, res, next) => {
  // This middleware simplifies error handling for asynchronous route handlers.
  // It ensures that any errors thrown in the async function `fn` are caught
  // and passed to the next error-handling middleware in Express.
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
