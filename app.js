var express = require('express');
var http = require('http');
var static = require('serve-static')
var path = require('path');
var bodyParser = require('body-parser')
var cookieparser= require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler')

// mongodb 모듈 사용
var MongoClient = require('mongodb').MongoClient;
var database;

function connectDB(){
    //포트번호는 명령프롬프트에서 볼 수 있음
    var databaseUrl = 'mongodb://localhost:27017'

    MongoClient.connect(databaseUrl, function(err, client){
        if (err){
            console.log('데이터베이스 연결 시 에러 발생함')
            return;
        }

        console.log('데이터베이스에 연결됨 : ' + databaseUrl)
        var db = client.db("local");
        database = db;
    })
}

var app = express();

app.set('port', process.env.PORT || 3000);
app.use('/public',static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitaialized:true
}));



var router = express.Router();


router.route('/process/login').post(function(req,res){
    console.log('/process/login 라우팅 함수 호출됨.');

    var paramId= req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    console.log('요청 파라미터 : ' + paramId + ', ' +paramPassword);

    if(database){
        authUser(database, paramId,paramPassword,function(err,docs){
            if(err){
                console.log('에러 발생.')
                res.writeHead(200,{"Content-Type":"text/html;charset=utf8"})
                res.write('<h1>에러 발생</h1>')
                res.end();
                return;
            }

            if(docs){
                console.dir(docs);
                res.writeHead(200,{"Content-Type":"text/html;charset=utf8"})
                res.write('<h1>사용자 로그인 성공</h1>')
                res.write('<div><p>사용자 : ' + docs[0].name + '</p></div>')
                res.write('<br><br><a href="/public/login2.html">다시 로그인하기</a>')
                res.end();
                return;
            }else{
                console.log('에러 발생.')
                res.writeHead(200,{"Content-Type":"text/html;charset=utf8"})
                res.write('<h1>사용자 데이터 조회 실패</h1>')
                res.end();
                return;
            }
        });
    }else{
        console.log('에러 발생.')
        res.writeHead(200,{"Content-Type":"text/html;charset=utf8"})
        res.write('<h1>데이터베이스 연결 안됨.</h1>')
        res.end();
    }

})

app.use('/',router);

var authUser = function(db, id, password, callback){
    console.log('authUser 호출됨. : ' + id+', '+ password)

    var users = db.collection('users');

    users.find({"id":id, "password":password}).toArray(function(err, docs){
        if(err){
            callback(err, null);
            return;
        }

        if(docs.length > 0){
            console.log('일치하는 사용자를 찾음');
            callback(null,docs)
        }else{
            console.log('일치하는 사용자를 찾지 못함')
            callback(null,null);
        }
    });

}



//404에러 처리
var errorHandler = expressErrorHandler({
    static:{
        '404' : './public/404.html'
    }
})

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('express server : %d',app.get('port'))
    //db연결을 위해 함수 호출
    connectDB();
}); 
