import { RateLimiterMemory } from 'rate-limiter-flexible';

// Max 5 failed login attempts per IP per 15 minutes
export const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15,
});

// Max 3 register attempts per IP per hour
export const registerRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60 * 60,
});
