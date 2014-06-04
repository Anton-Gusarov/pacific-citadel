//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io'),
    phantom = require('./ph.js')
    , port = (process.env.PORT || 8081);

//Setup Express
//var server = express.createServer();
var server = express();
//server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.static(__dirname + '/'));
//});

//setup the errors
/*server.use(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: {
            title : '404 - Not Found'
            ,description: ''
            ,author: ''
            ,analyticssiteid: 'XXXXXXX'
        },status: 404 });
    } else if (err) {
        res.render('500.jade', { locals: {
            title : 'The Server Encountered an Error'
            ,description: ''
            ,author: ''
            ,analyticssiteid: 'XXXXXXX'
            ,error: err
        },status: 500 });
    }
});*/
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){

    res.sendfile("views/index.html");
});

server.get('/url', function (req, res) {
    var url = req.query.q;

    phantom.getPage().then(function (page) {
        page.open(req.query.q, function (status) {
            page.get("content", function (value) {
                res.send(value);
                phantom.ph.exit();
            });
            /*page.evaluate(function () { return document.title; }, function (result) {
                console.log('Page title is ' + result);
                phantom.exit();
            });*/
        });
    });

});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
