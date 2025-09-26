import { factories } from '@strapi/strapi';

interface Subscriber {
  id: number;
  email: string;
  fullname?: string;
  isActive: boolean;
}

interface SubscribeRequest {
  email: string;
  fullname?: string;
}

interface UpdateStatusRequest {
  status: 'draft' | 'sent';
}

export default factories.createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
  async subscribe(ctx: any) {
    try {
      const { email, fullname } = ctx.request.body as SubscribeRequest;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('Invalid email format');
      }

      const existingSubscribers = await strapi.documents('api::subscriber.subscriber').findMany({
        filters: { email },
        limit: 1,
      });

      if (existingSubscribers && existingSubscribers.length > 0) {
        const existingSubscriber = existingSubscribers[0];
        if (!existingSubscriber.isActive) {
          const updatedSubscriber = await strapi.documents('api::subscriber.subscriber').update({
            documentId: existingSubscriber.documentId,
            data: {
              isActive: true,
              fullname: fullname || existingSubscriber.fullname,
              subscribedAt: new Date().toISOString(),
            },
          });

          return ctx.send({
            message: 'Successfully reactivated your subscription!',
            data: {
              email: updatedSubscriber.email,
              isActive: updatedSubscriber.isActive,
            },
          });
        } else {
          return ctx.send({
            message: 'You are already subscribed to our newsletter!',
            data: {
              email: existingSubscriber.email,
              isActive: existingSubscriber.isActive,
            },
          });
        }
      }

      const newSubscriber = await strapi.documents('api::subscriber.subscriber').create({
        data: {
          email,
          fullname: fullname || 'Anonymous',
          isActive: true,
          subscribedAt: new Date().toISOString(),
        },
      });

      return ctx.send({
        message: 'Successfully subscribed to newsletter!',
        data: {
          email: newSubscriber.email,
          isActive: newSubscriber.isActive,
        },
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return ctx.internalServerError('Failed to process subscription. Please try again later.');
    }
  },

  async updateStatus(ctx: any) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body as UpdateStatusRequest;

      if (!id) {
        return ctx.badRequest('Missing newsletter id');
      }
      if (!status || (status !== 'draft' && status !== 'sent')) {
        return ctx.badRequest('Invalid status. Must be either "draft" or "sent"');
      }

      const existing = await strapi.documents('api::newsletter.newsletter').findOne({
        documentId: id,
      });

      if (!existing) {
        return ctx.notFound('Newsletter not found');
      }

      const updated = await strapi.documents('api::newsletter.newsletter').update({
        documentId: id,
        data: {
          docStatus: status,
          sentAt: status === 'sent' ? new Date().toISOString() : null,
        },
      });

      return ctx.send({
        message: 'Status updated successfully',
        data: {
          id: updated.id,
          documentId: updated.documentId,
          docStatus: updated.docStatus,
          sentAt: updated.sentAt,
        },
      });
    } catch (error) {
      console.error('Update newsletter status error:', error);
      return ctx.internalServerError('Failed to update status');
    }
  },

  async find(ctx: any) {
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const results = await strapi.documents('api::newsletter.newsletter').findMany(sanitizedQuery);
    const sanitizedResults = await this.sanitizeOutput(results, ctx);

    return this.transformResponse(sanitizedResults);
  },

  async findOne(ctx: any) {
    const { id } = ctx.params;
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    const result = await strapi.documents('api::newsletter.newsletter').findOne({
      documentId: id,
      ...sanitizedQuery,
    });

    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async create(ctx: any) {
    const sanitizedData = (await this.sanitizeInput(ctx.request.body, ctx)) as object | undefined;

    const result = await strapi.documents('api::newsletter.newsletter').create({
      data: {
        ...(sanitizedData || {}),
        docStatus: 'draft',
        // Provide fallback values for required fields if missing
        title: (sanitizedData as any)?.title ?? 'Untitled Newsletter',
        subject: (sanitizedData as any)?.subject ?? 'No Subject',
        content: (sanitizedData as any)?.content ?? '',
      },
    });

    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async update(ctx: any) {
    const { id } = ctx.params;
    const sanitizedData = (await this.sanitizeInput(ctx.request.body, ctx)) as object | undefined;

    const result = await strapi.documents('api::newsletter.newsletter').update({
      documentId: id,
      data: sanitizedData || {},
    });

    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },

  async delete(ctx: any) {
    const { id } = ctx.params;

    const result = await strapi.documents('api::newsletter.newsletter').delete({
      documentId: id,
    });

    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },
}));
