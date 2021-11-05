const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const sitesRouter = require('./routes/sites');
const tanksRouter = require('./routes/tanks');
const tanksProductRouter = require('./routes/tank_product');
const dailyFeedbackRouter = require('./routes/dailyfeedbacks');
const approbationRouter = require('./routes/approbations');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sites', sitesRouter);
app.use('/tanks', tanksRouter);
app.use('/tank_products', tanksProductRouter);
app.use('/daily_feedback', dailyFeedbackRouter);
app.use('/approbations', approbationRouter);

const cors = require('cors')
app.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const router = express.Router();

router.get('*', (req, res) => {
    // res.sendFile('index.html', {root: viewsDir});
    res.status(StatusCodes.METHOD_NOT_ALLOWED).send("bad url");
});

module.exports = app;
