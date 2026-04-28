import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

export const auditLog = (action: string, entity: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || 'system';
        const entityId = req.params.id || 'N/A';
        
        logger.info('Audit log created', {
          action,
          entity,
          entityId,
          userId,
          timestamp: new Date().toISOString(),
          ip: req.ip
        });
      }
      return originalSend.apply(res, arguments as any);
    } as any;
    
    next();
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Exception', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
};
