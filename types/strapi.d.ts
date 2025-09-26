// types/strapi.d.ts
import '@strapi/strapi';

declare module '@strapi/strapi' {
  interface Core {
    documents(uid: string): {
      findMany(params?: any): Promise<any[]>;
      findOne(params: { documentId: string; fields?: string[]; populate?: any }): Promise<any>;
      create(params: { data: any }): Promise<any>;
      update(params: { documentId: string; data: any }): Promise<any>;
      delete(params: { documentId: string }): Promise<any>;
    };
  }
}

// Extend global types for better Strapi v5 support
declare global {
  namespace Strapi {
    interface Context {
      request: {
        body?: any;
        query?: any;
        files?: any;
      };
      params: Record<string, any>;
      status: number;
      body: any;
    }
  }
}