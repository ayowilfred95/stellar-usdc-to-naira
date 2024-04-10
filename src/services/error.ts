const get =require('lodash-es/get');

export function handleError(err: any) {
    return get(err, 'response.data', get(err, 'message', err));
  }
