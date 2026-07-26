import { Request, Response, NextFunction } from 'express';

// ─── Domain Validator Middleware Factory ──────────────────────────────────────
/**
 * Validates that the provided email matches the allowed college domain.
 * Domain is configurable via COLLEGE_EMAIL_DOMAIN env variable.
 * Example: COLLEGE_EMAIL_DOMAIN=college.edu  →  only *@college.edu allowed
 */
export const validateEmailDomain = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email } = req.body as { email?: string };
  const allowedDomain = process.env.COLLEGE_EMAIL_DOMAIN;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }

  if (!allowedDomain) {
    // If no domain restriction configured, skip the check
    return next();
  }

  // Build a strict RegExp
  // If the domain is dit.edu.in, we enforce exactly 10 digits for the ERP ID
  let domainRegex: RegExp;
  if (allowedDomain === 'dit.edu.in') {
    domainRegex = new RegExp(`^\\d{10}@${allowedDomain.replace('.', '\\.')}$`, 'i');
  } else {
    domainRegex = new RegExp(`^[a-zA-Z0-9._%+\\-]+@${allowedDomain.replace('.', '\\.')}$`, 'i');
  }

  if (!domainRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: allowedDomain === 'dit.edu.in' 
        ? `Registration is restricted to 10-digit ERP IDs (e.g., 1000021893@dit.edu.in).`
        : `Registration is restricted to ${allowedDomain} email addresses only.`,
    });
    return;
  }

  next();
};

// ─── General Error Handler ────────────────────────────────────────────────────
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error('❌ Unhandled Error:', err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
