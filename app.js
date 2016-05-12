var $ =		require('jquery'),
	fs =	require('fs'),			//파일을 읽고 쓸 수 있음.
	express = require('express'),
	app =	express(),	//파일을 라우팅하고 각종 권한을 조율하는 express.js(굉장히 중요)
	http =	require('http').Server(app),
	io =	require('socket.io')(http),
	mysql=	require('mysql'),
	md5 =	require('js-md5'),
	phpExpress = require('php-express')({binPath: 'php'}),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('php-session-middleware');

//////////////////////////////////////////////////////////////////////////////////////////////

//bodyParser를 통한 json과 urlencoded 사용 허용(GET,POST 변수를 주고받을 수 있게 함.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app
	.use(cookieParser('capstone'))
	.use(new session({
		handler:'file',
		opts:{
			path:'/tmp/'
		}
	}));

//express.js를 통한 서버 설정.
app.set('views', '../');

//PHP 엔진 설정
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

app.get('/.htaccess', function(req, res)
{
	res.sendFile('/var/www/html/v2/.htaccess');
});

//캡스톤 자바스크립트 설정
app.get('/js/capstone.js', function(req, res)
{
	console.log("Cookies: ", req.cookies);
	res.sendFile('/var/www/html/v2/js/capstone.js');
});


//모든 php 확장자의 파일은 php-express를 통해 라우팅 되도록 설정.
app.all(/.+\.php$/, phpExpress.router);
// routing all .php file to php-express

//////////////////////////////////////////////////////////////////////////////////////////////

var sql=mysql.createPool(
{
	host				: 'localhost',
	port				: '3306',
	user				: 'root',
	password			: 'zoqtmxhs',
	database			: 'capstone',
	connectionLimit		: 10000,
	insecureAuth		: 'true'
});
sql.query("set names utf8");

function UserInfo(uID, uName, uToken, uClient)
{
	this.id = uID;
	this.name = uName;
	this.uToken = uToken;
	this.socket = uClient;
}

// 토큰이 유효한지 검사한다.
function isValidToken(id,name,token)
{
	var ret = md5("caps"+id+"tone"+name);
	return token == ret;
}



//클라이언트가 최초로 접속을 할 시
io.on('connection', function(client)
{
	client.on('error',function(error)
	{
	});

	//서버가 먼저 인증을 요청한다.
	client.emit("auth");

	client.on('add new comment', function(id,name,token,des,fno){
		var d = new Date();
		//token의 유효성을 검사한다.
		if(isValidToken(id,name,token)) {
			sql.query("INSERT INTO dg_comment (description, upload_date, mem_no, file_no) VALUES ("+sql.escape(des)+",d.toUTCString(),(select mem_no from dg_member where email="+sql.escape(id)+"),(select parent_no from dg_file_list where file_no="+sql.escape(fno)+"))",function(err,rows,fields)
			{
				if(!err && typeof(rows) != "undefined")
					client.emit("add new comment", rows);
			});
		}
		});
	//send information이라는 명령어로 서버에게 인증을 보냈을 때(id, 닉네임, 토큰, 공방 번호, 댓글내용)
	client.on('send information',function(id,name,token,room)
	{
		
		//token의 유효성을 검사한다.
		if(isValidToken(id,name,token))
		{


			//요청된 공방 정보를 가져온다.
			sql.query("select name,description from dg_workshop where no = "+room,function(err,rows,fields)
			{
				if(err) console.log(err);
				
				if(rows.length>0)
					client.emit("send subject", rows[0].name, rows[0].description);
				else
					client.emit("subject error");
			});

			//공방에 적용되어 있는 단계를 가져온다.
			sql.query("select * from dg_workshop_process where workshop_no = "+room+" order by process_no asc",function(err,rows,fields)
			{
				if(err) console.log(err);

				if(rows.length > 0)
				{
					client.emit("send process", rows);
				}
			});



			//DB 댓글 받아와서 보여줌.
			sql.query("select description from dg_comment",function(err,rows)
			{
				if(rows.length>0)
					client.emit("toDB", rows);
				else
					client.emit("subject error");
			});


			//공방에 있는 글을 가져온다.
			sql.query("select * from dg_file_list where workshop_no = "+room+" order by upload_date asc",function(err,rows,fields)
			{
				if(err) console.log(err);

				if(rows.length > 0)
				{
					client.emit("send contents", rows);
				}

			});
			client.emit("greeting");
		}
		else console.log("invalid token");
	});

//DB 값을 사이드바에 보여줌.
		sql.query("select title from dg_file_list where workshop_no = 1",function(err,rows)
			{
				if(rows.length>0)
					client.emit("toDB", rows);
				else
					client.emit("subject error");
			});

//채팅 부분//
   client.emit('toclient',{msg:'Welcome !'});
   client.on('fromclient',function(data){
       client.broadcast.emit('toclient',data); // 자신을 제외하고 다른 클라이언트에게 보냄
       client.emit('toclient',data); // 해당 클라이언트에게만 보냄. 다른 클라이언트에 보낼려면?
       console.log('Message from client :'+data.msg);
	     })
});







http.listen(10004, function()
{
	console.log('now open *:10004.');
});
