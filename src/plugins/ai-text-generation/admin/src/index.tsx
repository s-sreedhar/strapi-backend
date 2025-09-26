import type { StrapiApp } from '@strapi/strapi/admin';
import { Magic } from '@strapi/icons';

export default {
  register(app: import('@strapi/strapi/admin').StrapiApp) {
    app.addMenuLink({
      to: '/plugins/ai-text-generation',
      icon: Magic,
      intlLabel: {
        id: 'ai-text-generation.title',
        defaultMessage: 'AI Text Generation',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ai-text-generation.settings.read', subject: null }
      ],
    });

    app.registerPlugin({
      id: 'ai-text-generation',
      name: 'AI Text Generation',
    });
  },
  bootstrap(app: import('@strapi/strapi/admin').StrapiApp) {
    // console.log(app.features);
  },
};