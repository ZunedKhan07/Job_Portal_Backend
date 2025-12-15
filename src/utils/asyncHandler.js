const asyncHandler = (requestHandler) => {   // Higher Order Func.
    return (req, res, next) => {  // next for use mddlewares
        Promise.resolve((requestHandler(req, res, next)))
        .catch((err) => {next(err)})
    }
}

export default asyncHandler