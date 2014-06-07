//Глобальная переменная для замера времени
//var starttime;

//                  ######  ########    ###    ########   ######  ##     ## 
//                  ##    ## ##         ## ##   ##     ## ##    ## ##     ## 
//                  ##       ##        ##   ##  ##     ## ##       ##     ## 
//                   ######  ######   ##     ## ########  ##       ######### 
//                        ## ##       ######### ##   ##   ##       ##     ## 
//                  ##    ## ##       ##     ## ##    ##  ##    ## ##     ## 
//                   ######  ######## ##     ## ##     ##  ######  ##     ## 
//поиск слова в словаре, передача его в searchindex
function searchRequest(){
document.getElementById('annotation').innerHTML="";
document.getElementById('turnword').innerHTML="";
document.getElementById('wordArr').innerHTML="";
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024); 
var word=document.getElementById('word').value;
word=word.toLowerCase();   
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "SELECT KOREN FROM RUSDICTIONARY WHERE WORD='"+word+"';",
            [],
            function(transaction, results){ 
                //записываем в root езультат запроса
                try {
                var root = results.rows.item(0)['KOREN'];
                }
                catch(e){
                    //Если нет результата, вывести сообщение
                    document.getElementById('annotation').innerHTML="Ничего не найдено!";
                    return 0;
                }
                //вызываем функцию с передачей переменной
                searchIndex(root);
            },
            killTransaction
            );
        }
    );

}
//поиск в turnword корня, вывод сколько и где встречается слово.
function searchIndex(root){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);  
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "SELECT * FROM TURNWORD WHERE WORD='"+root+"';",
            [],
            function(transaction, results){ 
                var nom=[];
                var graphnom=[];
                var word=[];
                var turn=[];
                //записать результат сразу в виде таблицы в переменную html, чтобы потом ее передать в div, который создан на index.html
                var html='<table border="1" style="margin: 5px 5px 5px 5px;background-color:#eeeee4; border-radius:5px;"><tr style="background-color:#fde910"><td colspan="3">Индексная таблица</td></tr><tr style="background-color:#fde910"><td>Номер аннотации</td><td>Слово</td><td>Очередь</td></tr>';
                for(var i=0;i<results.rows.length;i++){
                    nom[i] = results.rows.item(i)['NOM'];
                    graphnom[i] = results.rows.item(i)['GRAPHNOM'];
                    word[i] = results.rows.item(i)['WORD'];
                    turn[i] = results.rows.item(i)['TURN'];
                    //собственно сами результаты записываются
                    //html+='<tr><td>'+nom[i]+'</td><td>'+graphnom[i]+'</td><td>'+word[i]+'</td><td>'+turn[i]+'</td></tr>';
                    html+='<tr><td>'+graphnom[i]+'</td><td>'+word[i]+'</td><td>'+turn[i]+'</td></tr>';
                }
                html+='</table>';
                //передаем переменную html в div id="turnword"
                document.getElementById('turnword').innerHTML=html;
                graphnom.push(-1);
                temp_turn=[];
                //Передаем номер аннотации с проверкой на дублирование, чтобы аннотации не дублировались
                for(var i=0;i<results.rows.length;i++){
                    if (graphnom[i] != graphnom[i+1] && graphnom[i] != -1 ){
                        searchAnnotation(graphnom[i], root);
                    }
                }
            },
            killTransaction
            );
        }
    );
}
//поиск в graphics корня, вывод аннотации.
function searchAnnotation(graphnom, root){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);  
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "SELECT * FROM GRAPHICS WHERE NOM="+graphnom+";",
            [],
            function(transaction, results){ 
                var nom=[];
                var title=[];
                var annotation=[];
                var annotationRep=[];
                var authors=[];
                var bgnom=[];
                var preview=[];
                var graph=[];
                var html='<table border="1" style="margin:5px 5px 5px 5px;background-color:#eeeee4; border-radius:5px;"><tr style="background-color:#fde910"><td>NOM</td><td>ANNOTATION</td></tr>';
                //цикл оказался не нужен, ибо зпрос делается единоразово
                //for(var i=0;i<results.rows.length;i++){
                    nom = results.rows.item(0)['NOM'];
                    annotation = results.rows.item(0)['ANNOTATION'];
                    //Подсветка слов
                    regex = new RegExp(root+"([а-яА-я0-9_])*", "gi");
                    annotation = annotation.replace(regex,'<i style="color:#ffffff; background-color:#0000ff;">'+"\$&"+'</i>');
                    html+='<tr><td>'+nom+'</td><td>'+annotation+'</td></tr>';
                //конец убранного лишнего цикла
                //}
                html+='</table>';
                document.getElementById('annotation').innerHTML+=html;
            },
            killTransaction
            );
        }
    );

}
//                         ###    ########  ########  #### ##    ##  ######      
//                        ## ##   ##     ## ##     ##  ##  ###   ## ##    ##     
//                       ##   ##  ##     ## ##     ##  ##  ####  ## ##           
//                      ##     ## ##     ## ##     ##  ##  ## ## ## ##   ####    
//                      ######### ##     ## ##     ##  ##  ##  #### ##    ##     
//                      ##     ## ##     ## ##     ##  ##  ##   ### ##    ##     
//                      ##     ## ########  ########  #### ##    ##  ######      
//функция для обработки текста, для последующего занесения в словарь
function initAnnotation(){
    //starttime = +new Date();
    var textForPorter=document.getElementById('textForPorter').value;
    //delete special symbols
    //числа я не удаляю, могут занимать целое слово и при удалении сбить нумерацию.
    var withoutSymbols = textForPorter.replace(/[^а-яА-Я0-9 ]/g, '');
    //var wordArr = withoutSymbols.split(/\s*,\s*/);
    //разбиваю на массив по пробелу
    var wordArr = withoutSymbols.split(' ');
    for(var i=0;i<wordArr.length;i++){
        wordArr[i]=wordArr[i].toLowerCase();
    }
    var wordArrPorter=[];
    var html='<table border="1" style="margin:5px 5px 5px 5px;background-color:#e4e4e4; border-radius:5px;"><tr style="background-color:#9c9393"><td>Номер</td><td>Массив слов</td><td>Массив сокращенных слов</td></tr>';
    for(var i=0;i<wordArr.length;i++){
        wordArrPorter[i]=Porter(wordArr[i]);
        html+='<tr><td>'+i+'</td><td>'+wordArr[i]+'</td><td>'+wordArrPorter[i]+'</td></tr>';
    }
    html+='</table>';
    //выводит результат, массив оригинальный и массив сокращенных слов
    document.getElementById('wordArr').innerHTML=html;
    //addAnnotation(textForPorter, wordArrPorter);
    //проверка на повторные аннотации в БД
    matchRequestAnnotation(textForPorter, wordArrPorter);
    //собственно ввод массивов в словарь с ограничениями, типа два символа и стоп слова... не работает    
    for(var i=0;i<wordArr.length;i++){
        if(wordArr[i].length>2){
            if(wordArr[i]!='чем' && wordArr[i]!='Чем' && wordArr[i]!='или' && wordArr[i]!='под' && wordArr[i]!='Под' && wordArr[i]!='над' && wordArr[i]!='Над' && wordArr[i]!='изпод' && wordArr[i]!='Изпод' && wordArr[i]!='кто' && wordArr[i]!='Кто' && wordArr[i]!='кем' && wordArr[i]!='Кем' && wordArr[i]!='оно' && wordArr[i]!='Оно' && wordArr[i]!='его' && wordArr[i]!='Его' && wordArr[i]!='эти' && wordArr[i]!='Эти' && wordArr[i]!='эта' && wordArr[i]!='Эта' && wordArr[i]!='это' && wordArr[i]!='Это' && wordArr[i]!='они' && wordArr[i]!='Они' && wordArr[i]!='она' && wordArr[i]!='Она' && wordArr[i]!='ним' && wordArr[i]!='Ним' && wordArr[i]!='уже' && wordArr[i]!='Уже' && wordArr[i]!='ему' && wordArr[i]!='Ему' && wordArr[i]!='что' && wordArr[i]!='Что' && wordArr[i]!='нас' && wordArr[i]!='Нас'){
                matchRequest(wordArr[i], wordArrPorter[i]);
            }
        }
    }
    //console.log("add annotation: ",+new Date()-starttime,"ms");
}

//Делает запрос в бд по слову... должна вызываться в цикле и сравнивать, если ли слово из массива в словаре или нет.
function matchRequest(wordArr, wordArrPorter){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
    database.transaction (
        function(transaction){
            transaction.executeSql(
            "SELECT * FROM RUSDICTIONARY WHERE WORD='"+wordArr+"';",
            [],
            function(transaction, results){
                if(results.rows.length == 0){
                    addRoot(wordArr, wordArrPorter);
                }
                else{
                    document.getElementById('result').innerHTML+="["+wordArr+"]-уже существует в словаре<br>";
                }
            },
            killTransaction
            );
        }
    );
}

//добавление слова и корня в словарь
function addRoot(wordArr, wordArrPorter){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024); 
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "INSERT INTO RUSDICTIONARY (WORD, KOREN) values (?,?);",
            [wordArr, wordArrPorter],
            nullDataHandler,
            killTransaction
            );
        }
    );
}

//Делает запрос в бд по слову... должна вызываться в цикле и сравнивать, если ли слово из массива в словаре или нет.
function matchRequestAnnotation(textForPorter, wordArrPorter){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
    database.transaction (
        function(transaction){
            transaction.executeSql(
            "SELECT ANNOTATION FROM GRAPHICS WHERE ANNOTATION='"+textForPorter+"';",
            [],
            function(transaction, results){
                if(results.rows.length == 0){
                    addAnnotation(textForPorter, wordArrPorter);
                }
                else{
                    document.getElementById('result_annotation').innerHTML="Аннотация уже существует";
                }
            },
            killTransaction
            );
        }
    );
}

function addAnnotation(textForPorter, wordArrPorter){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
getMax(database,"NOM","GRAPHICS"); 
    database.transaction (
        function(transaction){        
            transaction.executeSql(
            "INSERT INTO GRAPHICS (NOM,ANNOTATION) values (?,?);",
            [INDEX, textForPorter],
            nullDataHandler,
            killTransaction
            );
        }
    );
   
for(var i=0;i<wordArrPorter.length;i++){
    indexTables(wordArrPorter[i], i);
}
}

//идексация таблиц
function indexTables(wordArrPorter, i){  
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
        //getMax(database,"NOM","TURNWORD");
                database.transaction (
                function(transaction){        
                    transaction.executeSql(
                    "INSERT INTO TURNWORD (GRAPHNOM,WORD,TURN) values (?,?,?);",
                    [INDEX, wordArrPorter, i],
                    nullDataHandler,
                    killTransaction
                    );
                }
            );
}
//                  ######## ########  ######                                
//                  ##          ##    ##    ##                               
//                  ##          ##    ##                                     
//                  ######      ##    ##                                     
//                  ##          ##    ##                                     
//                  ##          ##    ##    ##                               
//                  ########    ##     ######                                
//добавление слова и корня в словарь
function addDictionary(){
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
var newWord=document.getElementById('newWord');
var newRoot=document.getElementById('newRoot'); 
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "INSERT INTO RUSDICTIONARY (WORD, KOREN) values (?,?);",
            [newWord.value, newRoot.value],
            nullDataHandler,
            killTransaction
            );
        }
    );
}

//добавление слов в индексную таблицу вручную
function addTurnword(){
//переменная для подключения к бд
var database=openDatabase('Annotations', '1.0', 'Annotations', 512*1024*1024);
//вытаскиваем переданные формой значения по id
var nom=document.getElementById('nom');
var graphnom=document.getElementById('graphnom');
var word=document.getElementById('index_word');
var turn=document.getElementById('turn');   
// запрос в бд анонимной функцией
        database.transaction (
        function(transaction){
            transaction.executeSql(
            "INSERT INTO TURNWORD (NOM, GRAPHNOM, WORD, TURN) values (?,?,?,?);",
            [nom.value, graphnom.value, word.value, turn.value],
            nullDataHandler,
            killTransaction
            );
        }
    );
}

//Алгоритм Портера
function Porter(word) {
    var DICT = {
        RVRE: /^(.*?[аеиоуыэюя])(.*)$/i,
        PERFECTIVEGROUND_1: /([ая])(в|вши|вшись)$/gi,
        PERFECTIVEGROUND_2: /(ив|ивши|ившись|ыв|ывши|ывшись)$/i,
        REFLEXIVE: /(с[яь])$/i,
        ADJECTIVE: /(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/i,
        PARTICIPLE_1: /([ая])(ем|нн|вш|ющ|щ)$/gi,
        PARTICIPLE_2: /(ивш|ывш|ующ)$/i,
        VERB_1: /([ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/gi,
        VERB_2: /(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/i,
        NOUN: /(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/i,
        DERIVATIONAL: /.*[^аеиоуыэюя]+[аеиоуыэюя].*ость?$/i,
        DER: /ость?$/i,
        SUPERLATIVE: /(ейше|ейш)$/i,
        I: /и$/i,
        P: /ь$/i,
        NN: /нн$/i
    };
        word = word.replace(/ё/gi, 'e');
        var wParts = word.match(DICT.RVRE);
        if (!wParts) {
            return word;
        }
        var start = wParts[1];
        var rv = wParts[2];
        var temp = rv.replace(DICT.PERFECTIVEGROUND_2, '');
        if (temp == rv) {
            temp = rv.replace(DICT.PERFECTIVEGROUND_1, '$1');
        }
        if (temp == rv) {
            rv = rv.replace(DICT.REFLEXIVE, '');
            temp = rv.replace(DICT.ADJECTIVE, '');
            if (temp != rv) {
                rv = temp;
                temp = rv.replace(DICT.PARTICIPLE_2, '');
                if (temp == rv) {
                    rv = rv.replace(DICT.PARTICIPLE_1, '$1');
                }
            } else {
                temp = rv.replace(DICT.VERB_2, '');
                if (temp == rv) {
                    temp = rv.replace(DICT.VERB_1, '$1');
                }
                if (temp == rv) {
                    rv = rv.replace(DICT.NOUN, '');
                } else {
                    rv = temp;
                }
            }
        } else {
            rv = temp;
        }
        rv = rv.replace(DICT.I, '');
        if (rv.match(DICT.DERIVATIONAL)) {
            rv = rv.replace(DICT.DER, '');
        }
        temp = rv.replace(DICT.P, '');
        if (temp == rv) {
            rv = rv.replace(DICT.SUPERLATIVE, '');
            rv = rv.replace(DICT.NN, 'н');
        } else {
            rv = temp;
        }
        return start + rv;
    };
