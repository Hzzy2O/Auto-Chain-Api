import type { Handler } from 'express'

export function validateBody(requiredFields: string[]): Handler {
  return (req, res, next) => {
    const missingFields = []
    for (const field of requiredFields) {
      if (!req.body[field])
        missingFields.push(field)
    }

    if (missingFields.length > 0) {
      return res.status(400).send({
        error: `Missing required fields: ${missingFields.join(', ')}`,
      })
    }

    next()
  }
}
