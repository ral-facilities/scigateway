// single-spa doesn't come with any types - all single-spa code should be limited to this file.
import * as log from 'loglevel';
import * as singleSpa from 'single-spa';
import { NotificationType } from '../scigateway.types';
import { Plugin } from '../state.types';

const runScript = async (url: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;

    const body = document.getElementsByTagName('body')[0];
    body.appendChild(script);
  });
};

const loadReactApp = (name: string): singleSpa.LifeCycles => {
  // Plugins are loaded on to the window and define their own property name so can't guess this at compile time
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (window as any)[name];
};

export const singleSpaPluginRoutes: Record<string, string[]> = {};

async function loadApp(name: string, appURL: string) {
  let app: singleSpa.LifeCycles | object | undefined;
  try {
    app = await import(appURL);
  } catch {
    log.error(
      `Failed to load plugin ${name} from ${appURL} using import(), running legacy <script> import`
    );
    await runScript(appURL);
  }
  // register the app with singleSPA and pass a reference to the store of the app as well as a reference to the globalEventDistributor
  singleSpa.registerApplication(
    name,
    app && 'bootstrap' in app ? app : loadReactApp(name),
    (location) => {
      if (singleSpaPluginRoutes?.[name]) {
        if (
          singleSpaPluginRoutes[name].findIndex((route) =>
            location.pathname.startsWith(route)
          ) !== -1
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  );
}

async function init(plugins: Plugin[]): Promise<void> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const loadingPromises: Promise<any>[] = [];

  plugins
    .filter((p) => p.enable)
    .forEach((p) => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const loadingPromise: Promise<any> = loadApp(p.name, p.src)
        .then(() => {
          log.debug(`Successfully loaded plugin ${p.name} from ${p.src}`);
        })
        .catch(() => {
          // TODO: record error back on server somewhere
          log.error(`Failed to load plugin ${p.name} from ${p.src}`);
          document.dispatchEvent(
            new CustomEvent('scigateway', {
              detail: {
                type: NotificationType,
                payload: {
                  message: `Failed to load plugin ${p.name} from ${p.src}. 
                            Try reloading the page and if the error persists contact the support team.`,
                  severity: 'error',
                },
              },
            })
          );
        });
      loadingPromises.push(loadingPromise);
    });

  // wait until all stores are loaded and all apps are registered with singleSpa
  await Promise.all(loadingPromises);
}

const exports = { init };
export default exports;
