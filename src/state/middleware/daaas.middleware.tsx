import { AnyAction, Dispatch, Middleware } from 'redux';

const microFrontendMessageId = 'daaas-frontend';

const broadcastToPlugins = (action: AnyAction): void => {
  document.dispatchEvent(
    new CustomEvent(microFrontendMessageId, { detail: action })
  );
};

type microFrontendMessageType = CustomEvent<AnyAction>;

export const listenToPlugins = (dispatch: Dispatch): void => {
  document.addEventListener(microFrontendMessageId, event => {
    const pluginMessage = event as microFrontendMessageType;

    if (pluginMessage.detail && pluginMessage.detail.type) {
      // this is a valid message, send to Redux in the parent app
      // TODO: limit what types of messages can be sent to the system
      dispatch(pluginMessage.detail);
    } else {
      console.error(
        'Invalid message received from a plugin:\nevent.detail = ' +
          JSON.stringify(pluginMessage.detail)
      );
    }
  });
};

// this would normally be store => next => action but we don't need store
const DaaasMiddleware: Middleware = (() => (next: Dispatch<AnyAction>) => (
  action: AnyAction
): AnyAction => {
  if (action.payload && action.payload.broadcast) {
    broadcastToPlugins(action);
  }

  return next(action);
}) as Middleware;

export default DaaasMiddleware;
