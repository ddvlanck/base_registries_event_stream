import express from 'express';
import routes from './routes';
import { pool } from './utils/DatabaseConfiguration';

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

// Production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

app.set('port', process.env.PORT || 3_000);

pool.connect((err, client, release) => {
  if (err) {
    return console.error(`[Server]: Error trying to connect to database. Printing error:`, err.stack);
  }

  console.log(`[Server]: Connected to database. Starting API.`);
  app.listen(app.get('port'), () => {
    console.log(`[Server]: Listening on port ${app.get('port')}`);
  });
});

