
function initDB(){
//Инициализация базы данных
 try {
    if (!window.openDatabase) {
        alert("БД не поддерживаются");
        return;
    } 
    else {
        var shortName = 'Annotations';
        var version = '1.0';
        var displayName = 'Annotations';
        var maxSize = 512*1024*1024; // в байтах
        var myDB=openDatabase(shortName, version, displayName, maxSize);
    }
 } 
 catch(e) {
   alert('Ошибка при соединении с БД'+ e.message+".");
    //Обработка ошибок
    return;
 }
 //alert("База данных активирована.");
 document.getElementById('test').innerHTML+="База данных активирована! ";
 createTables(myDB);
 //insDB(myDB);
 //SYSTEMDB = myDB;
// selectTables(myDB);
}

//функция создания таблиц базы данных
function createTables(db){
// Создание таблиц локальной базы
 db.transaction(
    function (transaction) {
       transaction.executeSql(//Таблица Словарь ключевых слов
          'CREATE TABLE IF NOT EXISTS KWDICTIONARY  (WORD TEXT PRIMARY KEY);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица ключевых слов изображений
          'CREATE TABLE IF NOT EXISTS KEYWORDS (WORD TEXT, GRAPHNOM NUMBER,PRIMARY KEY (WORD,GRAPHNOM));', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица маркеров
          'CREATE TABLE IF NOT EXISTS MARKERS  (NOM NUMBER PRIMARY KEY,SRC BLOB);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица маркеров
          'CREATE TABLE IF NOT EXISTS PROFILES  (CLIENTID NUMBER PRIMARY KEY,NAME TEXT,NICKNAME TEXT,EMAIL TEXT,PHOTO BLOB,AVATAR BLOB);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица владельцев контента
          'CREATE TABLE IF NOT EXISTS GRAPHOWNERS  (CLIENTID TEXT,GRAPHNOM NUMBER,PRIMARY KEY (CLIENTID,GRAPHNOM));', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица маркеров
          'CREATE TABLE IF NOT EXISTS MARKERLINKS  (NOM NUMBER PRIMARY KEY, MARKERNOM NUMBER,ORIGINGRAPHNOM NUMBER, POSX NUMBER, POSY NUMBER, TARGETGRAPHNOM NUMBER, TITLE TEXT,ANNOTATION TEXT,AUTHORS TEXT);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
       transaction.executeSql(//Таблица изображений
          'CREATE TABLE IF NOT EXISTS GRAPHICS  (NOM NUMBER PRIMARY KEY,TITLE TEXT,ANNOTATION TEXT,AUTHORS TEXT,BGNOM NUMBER,PREVIEW BLOB,GRAPH BLOB);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
	   
	   transaction.executeSql(//Таблица слов русского языка
          'CREATE TABLE IF NOT EXISTS RUSDICTIONARY (WORD TEXT PRIMARY KEY,KOREN TEXT);', 
          [], 
          nullDataHandler, 
          killTransaction
       );
	   transaction.executeSql(//Таблица порядка слов в аннотациях
          'CREATE TABLE IF NOT EXISTS TURNWORD (NOM NUMBER PRIMARY KEY, GRAPHNOM NUMBER, WORD TEXT, TURN NUMBER);', 
          [], 
          successHandlerCreateDb, 
          killTransaction
       );
	   
	   
	   
	   
	   transaction.executeSql(//триггер перед удалением профиля
		  'CREATE trigger IF NOT EXISTS noProfile before delete on PROFILES for each row begin '+
		  'delete from GRAPHICS where NOM in (select GRAPHNOM from GRAPHOWNERS where CLIENTID=OLD.CLIENTID) and NOM not in (select GRAPHNOM from GRAPHOWNERS where CLIENTID != OLD.CLIENTID);'+
		  'delete from GRAPHOWNERS where CLIENTID = OLD.CLIENTID; end', 
		  [], 
		  nullDataHandler, 
		  killTransaction
	   ); 
	   transaction.executeSql(//триггер перед удалением изображения
		  'CREATE trigger IF NOT EXISTS noGraphic before delete on GRAPHICS for each row begin '+
		  'delete from KEYWORDS where GRAPHNOM = OLD.NOM;'+
		  'delete from MARKERLINKS where ORIGINGRAPHNOM = OLD.NOM or TARGETGRAPHNOM = OLD.NOM;'+
		  'delete from GRAPHOWNERS where GRAPHNOM = OLD.NOM; end',
		  [], 
		  nullDataHandler, 
		  killTransaction
	   ); 
	   transaction.executeSql(//триггер перед удалением из словаря ключевых слов
		  'CREATE trigger IF NOT EXISTS noWord before delete on KWDICTIONARY for each row begin '+
		  'delete from KEYWORDS where WORD = OLD.WORD; end', 
		  [], 
		  nullDataHandler, 
		  killTransaction
	   ); 
	   
	   transaction.executeSql(//триггер вместо удаления картинки маркера
		  'CREATE trigger IF NOT EXISTS noSource after delete on MARKERS for each row begin '+
		  'insert into MARKERS(NOM,SRC) values (OLD.NOM,"null");  end', 
		  [], 
		  successHandlerCreateTriggers, 
		  killTransaction
	   );
	     
	}
 );
}

//функции - обработчики транзакций
function nullDataHandler(transaction, results){
   //Результаты команды SQL не ожидаются, ничего делать не надо
}
function successHandlerCreateDb(transaction, results) {
//БД успешно создана
  //alert("Таблицы созданы");
  document.getElementById('test').innerHTML+="Таблицы созданы! ";
}
function successHandlerCreateTriggers(transaction, results) {
//триггеры успешно созданы
   //alert("Триггеры созданы");
   document.getElementById('test').innerHTML+="Триггеры созданы! ";  
}
function successHandlerDeleteFromDb(transaction,results) {
//база данных успешно очищена
	alert("База данных очищена");
}
//Выполнение транзакции продолжать нельзя. Вернуть true
function killTransaction(transaction, error){   
   alert('Сообщение:'+error.message+' (Код ошибки:' +error.code+')');
   return true; 
}



var INDEX;//номер для автоинкремента
var INDEXSECOND;
//искусственное заполнение базы данных
var CLIENTID = "1";
var GRAPHNOM = "1";
function insDB(db){

var profiles = [{name: "Петров", nickname: "Петя", email: "petrov@mail.ru", photo: "pict1.jpeg", avatar:"pict11.jpeg"},
				{name: "Иванов", nickname: "Ваня", email: "ivanov@mail.ru", photo: "pict2.jpeg", avatar:"pict22.jpeg"}];
var contents = [{title: "Введение в геометрию", annotation:"Введение в геометрию", authors: "Петров", bgnom: 1, preview:"data preview", graph:" data graph"},
				{title: "Аксиомы геометрии", annotation:"Аксиомы геометрии", authors: "Иванов", bgnom: 2, preview:"data preview", graph:"data graph"},
				{title: "Теоремы геометрии", annotation:"Теоремы геометрии", authors: "Петров, Иванов", bgnom: 1, preview:"data preview", graph:"data graph"}];
var words = ["геометрия","фигура"];
var newWords = ["пропорция","элемент"];
var links = [{markernom:1, origin:1 , posx:10,posy:10, target:2, title:"Маркер 1", annotation:"Ссылка на вторую", authors:"Авторы 1"},
			{markernom:2, origin:2 , posx:40,posy:80, target:3, title:"Маркер 2", annotation:"Ссылка на третью", authors:"Авторы 2"}];
var markers = [{src: "m1.png"},{src:"m2.png"}];
//создание профилей
for (var i=0; i<profiles.length;i++){
	createProfile(db, profiles[i]);
}
//создание контента
for(i=0; i<contents.length;i++){
	createContent(db, contents[i]);
}
//добавление новых ключевых слов к контенту и словарю
for (i=0;i<newWords.length;i++){
	addToKWD(db,newWords[i]);
}
//добавление ключевых слов к контенту из словаря
for (i=0;i<words.length;i++){
	addToKeywords(db,words[i]);
}
//добавление маркера контенту
for (i=0;i<links.length;i++){
	addMarker(db,links[i]);
}
//создание вида маркера
for (i=0;i<markers.length;i++){
	createMarker(db,markers[i]);
}

}
//функции заполнения базы данных
function createProfile(db, profile){
//создание профайла
getMax(db,"CLIENTID","PROFILES");
	db.transaction (
		function(transaction){
			transaction.executeSql(
			"INSERT INTO PROFILES (CLIENTID, NAME, NICKNAME, EMAIL, PHOTO, AVATAR) values (?,?,?,?,?,?);",
			[INDEX, profile.name, profile.nickname, profile.email, profile.photo, profile.avatar],
			nullDataHandler,
			killTransaction
			);
		}
	);

}

function createContent(db, content){
//создание контента и привязка к владельцу
getMax(db,"NOM","GRAPHICS");
	db.transaction (
		function(transaction){
			transaction.executeSql(
			"INSERT INTO GRAPHICS (NOM,TITLE,ANNOTATION,AUTHORS,BGNOM,PREVIEW,GRAPH) values (?,?,?,?,?,?,?);",
			[INDEX, content.title, content.annotation, content.authors, content.bgnom, content.preview, content.graph],
			nullDataHandler,
			killTransaction
			);
			
			transaction.executeSql(
			"INSERT INTO GRAPHOWNERS (CLIENTID, GRAPHNOM) values (?,?);",
			[CLIENTID, INDEX],
			nullDataHandler,
			killTransaction
			);
		}
	);
}




function addToKWD(db, word){
//добавление слова в словарь и к контенту
	db.transaction (
		function(transaction){
			transaction.executeSql(
			"INSERT INTO KWDICTIONARY (WORD) values (?);",
			[word],
			nullDataHandler,
			killTransaction
			);
			
			transaction.executeSql(
			"INSERT INTO KEYWORDS (WORD, GRAPHNOM) values (?,?);",
			[word, GRAPHNOM],
			nullDataHandler,
			killTransaction
			);
		}
	);


}

function addToKeywords(db, word){
//добавление ключевого слова к контенту
	db.transaction (
		function(transaction){
						
			transaction.executeSql(
			"INSERT INTO KEYWORDS (WORD, GRAPHNOM) values (?,?);",
			[word, GRAPHNOM],
			nullDataHandler,
			killTransaction
			);
		}
	);


}

function addMarker (db, link){
//добавление маркера контенту
getMax(db,"NOM","MARKERLINKS");	
		db.transaction (
		function(transaction){
						
			transaction.executeSql(
			"INSERT INTO MARKERLINKS (NOM,MARKERNOM,ORIGINGRAPHNOM, POSX, POSY, TARGETGRAPHNOM, TITLE,ANNOTATION,AUTHORS) values (?,?,?,?,?,?,?,?,?);",
			[INDEX, link.markernom, link.origin, link.posx, link.posy, link.target, link.title, link.annotation, link.authors],
			nullDataHandler,
			killTransaction
			);
		}
	);

}

function createMarker(db, marker){
//создание вида маркера
getMax(db,"NOM","MARKERS");	
		db.transaction (
		function(transaction){
						
			transaction.executeSql(
			"INSERT INTO MARKERS (NOM,SRC) values (?,?);",
			[INDEX, marker.src],
			nullDataHandler,
			killTransaction
			);
		}
	);

}

function getMax(db,fld,tbl){
//реализация автоинкремента
	db.transaction (
		function(transaction){
			transaction.executeSql(
			"SELECT max("+fld+") as new_id from "+tbl+";",
			[],
			function(transaction, results){ 
				INDEX = results.rows.item(0)['new_id'];
				if (INDEX == null) INDEX = 0;
				INDEX++;
				//alert("index="+INDEX);
			},
			killTransaction
			);
		}
	);
}

function getMaxSecond(db,fld,tbl){
//реализация автоинкремента
	db.transaction (
		function(transaction){
			transaction.executeSql(
			"SELECT max("+fld+") as new_id from "+tbl+";",
			[],
			function(transaction, results){ 
				INDEXSECOND = results.rows.item(0)['new_id'];
				if (INDEXSECOND == null) INDEXSECOND = 0;
				INDEXSECOND++;
				//alert("index="+INDEX);
			},
			killTransaction
			);
		}
	);
}


//var xml={ DATA:[]};// объект для данных базы

var xml={ DATA:[
{ table:"", keyword:[], graphnom:[] },
{ table:"", word:[] },
{ table:"", nom:[], src:[] },
{ table:"", id:[], name:[], nick:[], mail:[], photo:[], avatar:[] },
{ table:"", id:[], graphnom:[] },
{ table:"", nom:[], markernom:[], origin:[], posx:[], posy:[], target:[], title:[], annotation:[], author:[] },
{ table:"", nom:[], title:[], annotation:[], author:[], bgnom:[], preview:[], graph:[] }
]};
//функция выборки данных для создания XML
function selectTables(){
//выборка таблиц
var shortName = 'Annotations';
var version = '1.0';
var displayName = 'Annotations';
var maxSize = 512*1024*1024; // в байтах
var db=openDatabase(shortName,version,displayName,maxSize);
db.transaction(
function (transaction) {
	
	transaction.executeSql(//таблица ключевых слов
	'select * from KEYWORDS;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var keywords = graphnoms = [];
		for(var i=0;i<len;i++){
		xml.DATA[0].keyword[i]=results.rows.item(i)['WORD'];
		xml.DATA[0].graphnom[i]=results.rows.item(i)['GRAPHNOM'];
		}
		xml.DATA[0].table="KEYWORDS";
	//	xml.DATA[0]={table:"KEYWORDS", keyword:keywords, grahnom: graphnoms};
	}, 
	killTransaction
	);
	transaction.executeSql(//таблица словарь ключевых слов
	'select * from KWDICTIONARY;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var words = new Array();
		for(var i=0;i<len;i++){
			xml.DATA[1].word[i]=results.rows.item(i)['WORD'];
		}
		xml.DATA[1].table="KWDICTIONARY";
		//xml.DATA[1]={table:"KWDICTIONARY",word:words};
		//alert(xml.DATA[1].word);
	}, 
	killTransaction
	);
	transaction.executeSql(//таблица типов маркеров
	'select * from MARKERS;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var noms = srcs = [];
		for(var i=0;i<len;i++){
			xml.DATA[2].nom[i] = results.rows.item(i)['NOM'];
			xml.DATA[2].src[i] = results.rows.item(i)['SRC'];
		}
		xml.DATA[2].table="MARKERS";
		//xml.DATA[2]={table:"MARKERS", nom:noms, src:srcs};
	}, 
	killTransaction
	);
	transaction.executeSql(//таблица профилей
	'select * from PROFILES;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var ids=names=nicks=mails=photos=avatars=[];
		for(var i=0;i<len;i++){
			xml.DATA[3].id[i] = results.rows.item(i)['CLIENTID'];
			xml.DATA[3].name[i] = results.rows.item(i)['NAME'];
			xml.DATA[3].nick[i] = results.rows.item(i)['NICKNAME'];
			xml.DATA[3].mail[i] = results.rows.item(i)['EMAIL'];
			xml.DATA[3].photo[i] = results.rows.item(i)['PHOTO'];
			xml.DATA[3].avatar[i] = results.rows.item(i)['AVATAR'];
		}
		xml.DATA[3].table="PROFILES";
		//xml.DATA[3]={table:"PROFILES", id:ids, name:names, nick:nicks, mail:mails, photo:photos,avatar:avatars};
	}, 
	killTransaction
	);
	transaction.executeSql(//таблица пользователей
	'select * from GRAPHOWNERS;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var ids = graphnoms = [];
		for(var i=0;i<len;i++){
		xml.DATA[4].id[i] = results.rows.item(i)['CLIENTID'];
		xml.DATA[4].graphnom[i]=results.rows.item(i)['GRAPHNOM'];
		}
		xml.DATA[4].table="GRAPHOWNERS";
		//xml.DATA[4] = { table:"GRAPHOWNERS", id:ids, graphnom:graphnoms};
	}, 
	killTransaction
	);
	transaction.executeSql(//таблица лекций
	'select * from MARKERLINKS;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var noms = markernoms = origins = posxs = posys = targets = titles = annotations = authors = [];
		for(var i=0;i<len;i++){
			xml.DATA[5].nom[i] = results.rows.item(i)['NOM'];
			xml.DATA[5].markernom[i] = results.rows.item(i)['MARKERNOM'];
			xml.DATA[5].origin[i] = results.rows.item(i)['ORIGINGRAPHNOM'];
			xml.DATA[5].posx[i] = results.rows.item(i)['POSX'];
			xml.DATA[5].posy[i] = results.rows.item(i)['POSY'];
			xml.DATA[5].target[i] = results.rows.item(i)['TARGETGRAPHNOM'];
			xml.DATA[5].title[i] = results.rows.item(i)['TITLE'];
			xml.DATA[5].annotation[i] = results.rows.item(i)['ANNOTATION'];
			xml.DATA[5].author[i] = results.rows.item(i)['AUTHORS'];
		}
		xml.DATA[5].table="MARKERLINKS";
		//xml.DATA[5] = { table:"MARKERLINKS", nom:noms, markernom:markernoms, origin:origins , posx:posxs , posy: posys, target:targets, title:titles, annotation: annotations, author:authors};
	}, 
	killTransaction
	); 
	transaction.executeSql(//таблица лекций
	'select * from GRAPHICS;', 
	[], 
	function (transaction, results){
		var len=results.rows.length;
		//var noms = titles = annotations = authors = bgnoms = previews = graphs = [];
		for(var i=0;i<len;i++){
			xml.DATA[6].nom[i] = results.rows.item(i)['NOM'];
			xml.DATA[6].title[i] = results.rows.item(i)['TITLE'];
			xml.DATA[6].annotation[i] = results.rows.item(i)['ANNOTATION'];
			xml.DATA[6].author[i] = results.rows.item(i)['AUTHORS'];
			xml.DATA[6].bgnom[i] = results.rows.item(i)['BGNOM'];
			xml.DATA[6].preview[i] = results.rows.item(i)['PREVIEW'];
			xml.DATA[6].graph[i] = results.rows.item(i)['GRAPH'];
		}
		xml.DATA[6].table="GRAPHICS";
	//	xml.DATA[6] = { table:"GRAPHICS", nom: noms, title:titles, annotation: annotations, author:authors, bgnom:bgnoms, preview:previews, graph:graphs};	
		createXML();
	}, 
	killTransaction
	); 
}
);
}

function createXML(){
$.ajax({
type: "POST",
url: "create_xml.php",
data: xml,
success: function(response){
	alert ("XML is ready");
}
});
}
//функция очистки базы
function deleteFromTables(){
//очистка таблиц
var shortName = 'Annotations';
var version = '1.0';
var displayName = 'Annotations';
var maxSize = 512*1024*1024; // в байтах
var db=openDatabase(shortName,version,displayName,maxSize);
db.transaction(
	function(transaction){

		transaction.executeSql(
			"DROP TRIGGER noSource;",
			[],
			nullDataHandler,
			killTransaction
		);
		transaction.executeSql(
			"DELETE FROM GRAPHICS;",
			[],
			nullDataHandler,
			killTransaction
		);
		transaction.executeSql(
			"DELETE FROM PROFILES;",
			[],
			nullDataHandler,
			killTransaction
		);
		transaction.executeSql(
			'DELETE FROM MARKERS;',
			[],
			nullDataHandler,
			killTransaction
		);
		transaction.executeSql(
			'DELETE FROM KWDICTIONARY;',
			[],
			nullDataHandler,
			killTransaction
		);
		transaction.executeSql(
			'DELETE FROM TURNWORD;',
			[],
			successHandlerDeleteFromDb,
			killTransaction
		);
	}
);
}

//-----------------------------------------------
//-----------------------------------------------
//-----------------------------------------------
//-----------------------------------------------
//если нужно заолнить таблички, смотри функции в файле fts.js там примеры запросов