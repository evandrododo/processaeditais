var express = require('express');
var app = express();
var textract = require('textract');
var cors = require('cors')
var editais = [];
//requiring path and fs modules
var path = require('path');
var fs = require('fs');
//joining path of directory 
var directoryPath = path.join(__dirname, 'amostras-editais');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/atualizar', function (req, res) {
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 

        //listing all files using forEach
        files.forEach(function (file) {
            const pathFile = directoryPath+"/"+file
            console.log("Lendo arquivo: ",pathFile)
            extractFile(pathFile)
        });
    })
    res.send("Atualizado!")
});

app.get('/', function (req, res, next) {
    // res.send("retorno simples")
    res.send(editais)
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});

extractFile = (filePath) => {
   textract.fromFileWithPath(filePath, function (error, text) { 
       infos = buscaInfos(text);
       editais.push(infos);
       console.log("Editais cadastrados: ", editais.length)
   })
}

buscaInfos = (fileTxt) => {
    console.log("Infos de texto: ", fileTxt)
    if(!fileTxt) {
        return {}
    }

    var re_numero = /N\.. (.*?\/.*?\/.*?\/....)/
    var re_modalidade = /^EDITAL DE (.*?) ((PARA)|(N\.))/
    var re_exclusivo_micro = /EXCLUSIVO PARA MICROEMPRESA/
    var re_objeto = /DO OBJETO.*?[0-9]\.[0-9]\. (.*?) [0-9]\./
    var re_valor_estimado = /DA DOTAÇÃO ORÇAMENTÁRIA (.*?)7\. /
    var re_inicio = /Início da sessão.*?: Dia (.*?)\./

    num_edital = fileTxt.match(re_numero);
    modalidade = fileTxt.match(re_modalidade);
    exclusivo_micro = fileTxt.match(re_exclusivo_micro);
    valor_estimado = fileTxt.match(re_valor_estimado);
    orgao = "Secretaria Municipal da Administração";
    inicio = fileTxt.match(re_inicio);
    objeto_completo = fileTxt.match(re_objeto);

    infos = {
        num_edital: num_edital && num_edital[1],
        orgao: orgao,
        modalidade: modalidade && modalidade[1],
        exclusivo_micro: exclusivo_micro ? true : false,
        inicio: inicio && inicio[1],
        valor_estimado: valor_estimado && valor_estimado[1],
        objeto_completo: objeto_completo && objeto_completo[1]
    }

    return infos;
}