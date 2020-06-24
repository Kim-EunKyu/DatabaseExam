var express = require("express");
var http = require("http");
var static = require("serve-static");
var path = require("path");
var bodyParser = require("body-parser");
var cookieparser = require("cookie-parser");
var expressSession = require("express-session");
var expressErrorHandler = require("express-error-handler");

// mongodb 모듈 사용
var mongoose = require("mongoose");
var database;
var UserSchema;
var UserModel;

function connectDB() {
  //포트번호는 명령프롬프트에서 볼 수 있음
  var databaseUrl = "mongodb://localhost:27017/local";

  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on("open", function () {
    console.log("데이터베이스에 연결됨 : " + databaseUrl);

    UserSchema = mongoose.Schema({
      id: { type: String, required: true, unique: true },
      name: { type: String, index: "hashed" },
      password: { type: String, required: true },
      age: { type: Number, default: -1 },
      created_at: { type: Date, index: { unique: false }, defalut: Date.now() },
      updated_at: { type: Date, index: { unique: false }, default: Date.now() },
    });

    console.log("UserSchema 정의함.");

    UserSchema.static("findById", (id, callback) => {
      return this.find({ id: id }, callback);
    });

    UserSchema.static("findAll", (callback) => {
      return this.find({}, callback);
    });

    UserModel = mongoose.model("users2", UserSchema);
    console.log("UserModel 정의함.");
  });

  database.on("disconnected", function () {
    console.log("데이터베이스 연결 끊어짐");
  });

  database.on("error", console.error.bind(console, "mongoose 연결 에러."));

  // MongoClient.connect(databaseUrl, function(err, client){
  //     if (err){
  //         console.log('데이터베이스 연결 시 에러 발생함')
  //         return;
  //     }

  //     console.log('데이터베이스에 연결됨 : ' + databaseUrl)
  //     var db = client.db("local");
  //     database = db;
  // })
}

var app = express();

app.set("port", process.env.PORT || 3000);
app.use("/public", static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitaialized: true,
  })
);

var router = express.Router();

router.route("/process/login").post(function (req, res) {
  console.log("/process/login 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  console.log("요청 파라미터 : " + paramId + ", " + paramPassword);

  if (database) {
    authUser(database, paramId, paramPassword, function (err, docs) {
      if (err) {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }

      if (docs) {
        console.dir(docs);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 로그인 성공</h1>");
        res.write("<div><p>사용자 : " + docs[0].name + "</p></div>");
        res.write('<br><br><a href="/public/login2.html">다시 로그인하기</a>');
        res.end();
        return;
      } else {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 데이터 조회 실패</h1>");
        res.end();
        return;
      }
    });
  } else {
    console.log("에러 발생.");
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결 안됨.</h1>");
    res.end();
  }
});

router.route("/process/adduser").post(function (req, res) {
  console.log("/process/adduser 라우팅 함수 호출됨.");

  var paramId = req.body.id || req.query.id;
  var paramPassword = req.body.password || req.query.password;
  var paramName = req.body.name || req.query.name;

  console.log(
    "요청 파라미터 : " + paramId + " , " + paramPassword + " , " + paramName
  );

  if (database) {
    addUser(database, paramId, paramPassword, paramName, function (
      err,
      result
    ) {
      if (err) {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }

      if (result) {
        console.dir(result);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 추가 성공</h1>");
        res.write("<div><p>사용자 : " + paramName + "</p></div>");
        res.end();
        return;
      } else {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>사용자 추가 안됨</h1>");
        res.end();
        return;
      }
    });
  } else {
    console.log("에러 발생.");
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결 안됨.</h1>");
    res.end();
  }
});

router.route("/process/listuser").post((req, res) => {
  console.log("/process/listuser 라우팅 함수 호출됨.");

  if (database) {
    UserModel.findAll((err, results) => {
      if (err) {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>에러 발생</h1>");
        res.end();
        return;
      }

      if (results) {
        console.dir(results);

        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h3>사용자리스트</h3>");
        res.write("<div><ul>");

        for (let i = 0; i < results.length; i++) {
          let curId = results[i]._doc.id;
          let curName = results[i]._doc.name;
          res.write(
            "    <li>#" + i + " -> " + curId + ", " + curName + "</li>"
          );
        }
        res.write("</ul></div>");
        res.end();
      } else {
        console.log("에러 발생.");
        res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
        res.write("<h1>조회된 사용자 없음. </h1>");
        res.end();
      }
    });
  } else {
    console.log("에러 발생.");
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8" });
    res.write("<h1>데이터베이스 연결 안됨.</h1>");
    res.end();
  }
});

app.use("/", router);

var authUser = function (db, id, password, callback) {
  console.log("authUser 호출됨. : " + id + ", " + password);

  UserModel.findById(id, function (err, results) {
    if (err) {
      callback(err, null);
      return;
    }

    console.log("아이디 %s로 검색한 결과");
    if (results.length > 0) {
      if (results[0]._doc.password === password) {
        console.log("비밀번호 일치함.");
        callback(null, results);
      } else {
        console.log("비밀번호 일치하지 않음.");
        callback(null, null);
      }
    } else {
      console.log("아이디 일치하는 사용자 없음.");
      callback(null, null);
    }
  });

  UserModel.find({ id: id, password: password }, function (err, docs) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("###docs.length : " + docs.length);
    if (docs.length > 0) {
      console.log("일치하는 사용자를 찾음");
      callback(null, docs);
    } else {
      console.log("일치하는 사용자를 찾지 못함");
      callback(null, null);
    }
  });
};

var addUser = function (db, id, password, name, callback) {
  console.log("addUser호출됨");

  var user = new UserModel({ id: id, password: password, name: name });

  user.save(function (err) {
    if (err) {
      callback(err, null);
      return;
    }

    console.log("사용자 데이터 추가함.");
    callback(null, user);
  });
};

//404에러 처리
var errorHandler = expressErrorHandler({
  static: {
    "404": "./public/404.html",
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var server = http.createServer(app).listen(app.get("port"), function () {
  console.log("express server : %d", app.get("port"));
  //db연결을 위해 함수 호출
  connectDB();
});
