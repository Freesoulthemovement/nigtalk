import { z } from 'zod';
import { insertTribeSchema, insertVideoSchema, insertMessageSchema, tribes, videos, messages, tribeMembers, users, userBestowals } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  tribes: {
    list: {
      method: 'GET' as const,
      path: '/api/tribes' as const,
      responses: {
        200: z.array(z.custom<typeof tribes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tribes' as const,
      input: insertTribeSchema,
      responses: {
        201: z.custom<typeof tribes.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tribes/:id' as const,
      responses: {
        200: z.custom<typeof tribes.$inferSelect & { members: (typeof tribeMembers.$inferSelect & { user: typeof users.$inferSelect })[] }>(),
        404: errorSchemas.notFound,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/tribes/:id/join' as const,
      responses: {
        200: z.custom<typeof tribeMembers.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  videos: {
    list: {
      method: 'GET' as const,
      path: '/api/videos' as const,
      input: z.object({
        tribeId: z.coerce.number().optional(),
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof videos.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/videos' as const,
      input: insertVideoSchema,
      responses: {
        201: z.custom<typeof videos.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/tribes/:id/messages' as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect & { user: typeof users.$inferSelect }>()),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tribes/:id/messages' as const,
      input: z.object({ content: z.string(), isRadio: z.boolean().optional() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    dm: {
      list: {
        method: 'GET' as const,
        path: '/api/dm/:userId' as const,
        responses: {
          200: z.array(z.custom<typeof messages.$inferSelect & { user: typeof users.$inferSelect }>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/dm/:userId' as const,
        input: z.object({ content: z.string() }),
        responses: {
          201: z.custom<typeof messages.$inferSelect>(),
          401: errorSchemas.unauthorized,
        },
      },
      conversations: {
        method: 'GET' as const,
        path: '/api/dm' as const,
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
        },
      },
    },
  },
  bestowal: {
    get: {
      method: 'GET' as const,
      path: '/api/bestowal' as const,
      responses: {
        200: z.custom<typeof userBestowals.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/bestowal' as const,
      input: z.object({ monthlyAmount: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof userBestowals.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type Tribe = z.infer<typeof api.tribes.get.responses[200]>;
export type VideoWithUser = z.infer<typeof api.videos.list.responses[200]>[number];
export type MessageWithUser = z.infer<typeof api.messages.list.responses[200]>[number];
