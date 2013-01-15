
var path = require('path')
var cheerio = require('cheerio')
var fs = require('fs')
var ejs = require('ejs')
var _ = require('underscore')
var express = require('express')

//var fluorine = require('fluorine').fluorine
//fluorine.infect()

var app = express()
var http = require('http')
var server = http.createServer(app)

//var ws = new (require('websocket').server)({httpServer: server, port: 3030})

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function()
{
    app.set('views', __dirname+'/template');
    app.set("view options",{layout:false});
    app.use('/library',express.static( __dirname + '/library'));
    app.use('/media',express.static( __dirname + '/media'));
    //app.use(allowCrossDomain)
    app.use(express.methodOverride());
    app.use(express.bodyParser());
});

app.get('/', function(req,res){

    var dpaths = getPageletsDirectoriesSync(__dirname+'/pagelets')
    var pagelets = _.reduce(dpaths, function(mem, dp)
    {
        var fpath = dp.path
        var name  = dp.name
        var pagelet = getPageletSync(fpath)
        pagelet['script'] = mergeSync(pagelet['scripts'])
        pagelet['style']  = mergeSync(pagelet['styles']) 
        pagelet['merged'] = htmlFromPagelet(pagelet)

        mem[name] = pagelet

        return mem
    }, {})

//console.log(pagelets)

    _.each
    (   pagelets
    ,   function(pagelet, id)
    {
//console.log(id)
//console.log('----')
// for debugging: Instead real streaming.
//console.log(pagelet.merged)
//console.log('====')

    res.write(pagelet.merged)

    }
    )    
    res.end()

    //res.send(_.pick(pagelets, 'merged'))
});

function htmlFromPagelet(pagelet)
{
    return (
    [ pagelet.pagelet
    , '<script>\n'+pagelet.script+'</script>'
    , '<style>\n'+pagelet.style+'</style>'
    ].join("\n"))
}

// [Path] -> FileContent ( merged scripts content )
//
function mergeSync(paths)
{
    return _.map(paths,function(path)
    {
         return readScriptSync(path)
    }).join("\n//---- merged ---- \n")
}


// Path -> FileContent
//
// File must be encoded as UTF-8.
function readScriptSync(fpath)
{
    return fs.readFileSync(fpath, 'UTF-8')
}

// Generate pagelet's script path from it's directory path and the pagelet's name.
function scriptPath(dpath, name)
{
    return dpath+'/'+name
}

// Path ( pagelet file path ) 
//    -> { pagelet: HTML, scripts: [ HTML ( script tag, with `src` ) ], styles: [ HTML ( link tag, with `href` ) ] }
//
// File MUST encoded as UTF-8.
function getPageletSync(fpath)
{

    var data = fs.readFileSync(fpath, 'UTF-8')
    $ = cheerio.load(data)
    return ( 
        { 'pagelet': $.html('.pagelet')
        , 'scripts': $('script').map(function(idx, e)
          { 
                // TODO: Bad? Current dir prefix hard-coded.
                return path.dirname(fpath)+'/'+$(e).attr('src')
          })
        , 'styles': $('link').map(function(idx, e)
          {
                return path.dirname(fpath)+'/'+$(e).attr('href')
          })
        })
}

// Path ( to pagelets directory ) -> [ {path: Path ( each pagelet's path ), name: Name} ]
function getPageletsDirectoriesSync(dpath)
{
    var files = fs.readdirSync(dpath)
    var result = _.chain(files).
      reject(function(name)
      {
            if(name == "." || name == ".."){ return true }
            return false 
      }).
      map(function(name)
      {
            return {'path': dpath+"/"+name+"/"+name+'.html', 'name': name}
      }).
      value()

    return result
}


/*

app.all('/*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
//      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
});

app.get('/', function(req,res){
    res.render('spec.ejs')
});

app.get('/testAjax', function(req,res){
    res.send('10')
});

app.get('/testUI/:slc', function(req,res){
    res.send(req.params.slc)    // send the selector back.
});

app.post('/testAjax', function(req, res){
    if( 'foobar' == req.param('a') )
    {
        res.send('post ok')
    }
    else
    {
        res.send('others')  // FIXME: Binary data ?
    }
});

app.put('/testAjax', function(req, res){
    if( 'foobar' == req.param('a') )
    {
        res.send('put ok')
    }
    else
    {
        res.send('others')  // FIXME: Binary data ?
    }
});

app.delete('/testAjax/:test', function(req, res){
    if( 'asd' == req.params.test )
    {
        res.send('delete ok')
    }
    else
    {
        res.send('not ok')
    }
});


ws.on
(   'request'
,   function(req)
{   var connection = req.accept(null, req.origin)
    console.log('req',req)

    // another event in
    connection.on
    (   'message'
    ,   function(data)
    {
        ws.send('10')
        console.log('[DEBUG] test data: ', data)
    }
    )
}
)
*/

server.listen(process.env.PORT || 3000);
