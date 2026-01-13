import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import bcrypt from "bcryptjs";
import { getSessionConfig } from "./config/session";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Get session configuration from config module
  const sessionSettings = getSessionConfig(app);

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // SECURITY HARDENING: Reject authentication if user not found OR inactive
        // Generic error message to prevent user enumeration
        if (!user || !user.isActive) {
          return done(null, false);
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // SECURITY HARDENING: Safe session rehydration
  // If user is missing or deactivated, treat as unauthenticated (logout)
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      // If user not found or deactivated, don't restore session
      if (!user || !user.isActive) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
