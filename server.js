//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
//    phantom = require('./ph.js')
//    phPage = require("./phantom-page.js")
    , port = (process.env.PORT || 8081),
    bodyParser = require('body-parser'),
    uuid = require('node-uuid'),
    mysql      = require('mysql'),
    Busboy = require('busboy'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    mysqlLocal = {
        host     : '127.0.0.1',
        user     : 'root',
        password : '',
        database:  'deployment'
    },
    mysqlHeroku = {
        host     : 'mysql://b5689112595a87:b3e42b75@us-cdbr-iron-east-01.cleardb.net/heroku_79618f98f4dfc5c?reconnect=true',
//        user     : 'b5689112595a87',
//        password : 'b3e42b75',
        database:  'deployment'
    },
    mysqlHerokuUrl = 'mysql://b5689112595a87:b3e42b75@us-cdbr-iron-east-01.cleardb.net/heroku_79618f98f4dfc5c?reconnect=true',
    env = process.argv[process.argv.length - 1] === "--production" ? "production" : "development",
    connection = mysql.createPool(env === "production" ? mysqlHerokuUrl : mysqlHerokuUrl),
//    connection,
    currentPath = __dirname|| "/Users/anton/polling",
    codePaths = {
        "adfox.flash": path.join(currentPath, '/static/adfox/prepareCodeFlash.js'),
        "adfox.fullscreen": path.join(currentPath, '/static/adfox/prepareCodeFullScreen.js'),
        "adfox.screenglide": path.join(currentPath, '/static/adfox/prepareCodeScreenGlideFLV.js'),
        "adfox.screenglidefullscreen": path.join(currentPath, '/static/adfox/prepareCodeScreenGlideFullscreen.js'),
        "adriver.custom": path.join(currentPath, '/static/adriver/adriver.custom.js')
    };

function replace(data, str) {
    return result = str.replace(/\{\{(.*?)\}\}/g, function(match, token) {
        return data[token];
    });
}

//console.log(currentPath);
/*connection.connect(function (err) {
    if (err) {
        console.log(err);
    }
    console.log('connected as id ' + connection.threadId);

});*/
connection.on('connection', function(conn) {
//    connection = conn;
    console.log('connected as id ' + conn.threadId);
});
process.on('exit', function () {
//    connection.release();
});

//Setup Express
//var server = express.createServer();
var server = express();
//server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(express.static(__dirname + '/'));
    server.use(bodyParser.json({limit: '50mb'}));
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
var regexp = new RegExp('<script(>|\\s(?!type="text/javascript"\\s+src|src|src=".+"\\s+type="text/javascript")[^>]*>)(.{1,2000}</script>)','gim');
var regexp2 = /<script[^<]*?>[\S\s]*?<\/script>/gmi;
server.get('/url', function (req, res) {

    var url = req.query.q;
    var content = '';
    var phantom = require('child_process').spawn('phantomjs', ['phantom-page.js', url]);
    phantom.stdout.setEncoding('utf8');
    phantom.stdout.on('data', function(data) {
        content += data.toString();
    });
    phantom.on('exit', function(status_code) {
        if (status_code !== 0) {
//            console.log('error');
        } else {
            content = content.replace(regexp2, "");
            res.send(content);
        }
    });

});

server.get('/exposure/:id/', function(req, res){

    connection.query("SELECT * FROM `deployment` WHERE Deployment_ID='"+ req.params.id +"'", function (err, rows) {
        res.send(rows[0].Content);
    });

});

server.get('/script', function(req, res){

    var file = fs.readFileSync(codePaths[req.query.code], "utf8"),
        sgCodes = ["adfox.screenglide"];
    if (req.query.files && req.query.files.length > 0) {
        req.query.file1 = req.query.files[0];
        req.query.file2 = req.query.files[1];
        if (sgCodes.indexOf(req.query.code) > -1) {
            req.query.file1 = "panel1.swf";
            req.query.file2 = "panel2.swf";
        }
    }
    res.send(replace(req.query, file));

});

server.post('/put', function (req, res) {
    var data = {
        content: req.body.content,
        url: req.body.url,
        id: req.body.uuid || uuid.v1()
    };
//    debugger;
    connection.query("INSERT INTO `deployment` (Deployment_ID, Content, Placeholder_ID) VALUES ('"+
        data.id +
        "', "+
        connection.escape(data.content)+
        ", '"+
        data.placeholderID
        +"')",
        function (err, rows) {
            var response = {
                exposureUrl: res.req.headers.origin + "/exposure/" + data.id + "/"
            };
            res.send(err ? err : response);
        }, function (err, result) {
            "";
        });

});

function makeFolder (_uuid, cb) {
    var _uuid = _uuid || uuid.v1(),
        saveToPath = path.join(currentPath, "files", _uuid);
//    console.log('field');
    fs.mkdir(saveToPath, function (err) {
        cb && cb();
    });
}

function copyFiles(files, uuid) {
    files.forEach(function (filename) {
        var saveTo = path.join(currentPath, "files", uuid, filename),
            saveFrom = path.join(currentPath, "files", "tmp", filename),
            read = fs.createReadStream(saveFrom),
            write = fs.createWriteStream(saveTo);
        read.pipe(write);
    });
}

server.post('/files', function (req, res, next) {
    var busboy = new Busboy({ headers: req.headers }),
        tmpDir = path.join(currentPath, "files", "tmp"),

        _uuid, uuidBody = req.body.uuid,
        files = [];

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var saveTo = path.join(tmpDir, path.basename(fieldname));
        file.on('end', function() {
//            console.log('File [' + fieldname +'] Finished');
        });
        file.pipe(fs.createWriteStream(saveTo));
        files.push(path.basename(fieldname));
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        if (fieldname !== 'uuid') return;
        _uuid = (val && val !== "undefined" ? val : uuidBody) || uuid.v1();
    });

    busboy.on('finish', function() {
        _uuid = _uuid || uuidBody || uuid.v1();
        makeFolder(_uuid, copyFiles.bind(this, files, _uuid));
        res.end(JSON.stringify({uuid: _uuid, files: files}));
    });

    busboy.on('end close', function() {
//        console.log('busboy end');
    });
    busboy.on('error', function(err) {
//        console.log(err);
        });
//    req.pipe(fs.createWriteStream('files/req'));
    return req.pipe(busboy);
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
//    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
