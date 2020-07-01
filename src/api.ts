import express from 'express';
import routes from './routes/index';

import waitForPostgres from './../dependencies/wait-for-postgres/lib';

import { configuration } from './utils/Configuration';

const app = express();
app.use('/', routes);

// Error handlers

// Development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.set('port', process.env.PORT || 8000);

(async () => {
  const connected = await waitForPostgres.wait(configuration.database);

  if (connected == 0) {
    const server = app.listen(app.get('port'), () => {
      console.log('Express server listening on port ' + app.get('port'));
    });
  }

  console.log('Done')
})().catch(e => console.error(e.stack));


