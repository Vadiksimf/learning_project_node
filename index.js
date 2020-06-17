// Импот модулей доступных в node.js  по умолчанию
const fs = require('fs'); // Создание модуля fs (file system)
const http = require('http'); // Модуль для создания сервера
const url = require('url'); // Модуль для создания маршрутизации

// Импот модулей скачаных из npm
const slugify = require('slugify');
// Импот модулей из отдельного файла
const replaceTemplate = require('./modules/replaceTemplate');

//-----------------------------ФАЙЛЫ----------------------------------//
//------------------- Блокирующий, синхронный метод
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is what we know about avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written');

//------------------- Неблокирующий, асинхронный метод

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('ERROR!')

//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//             console.log(data3)
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written :)');
//             })
//         });
//     });
// });
// console.log('Will read file!')

//-----------------------------СЕРВЕР----------------------------------//

// "." переводится в команду dir/cd, и ищет путь в дирректории, из которой запущен node.js
// ${__dirname} - выбирает дирректорию, где расположен текущий файл node
const tempOverview = fs.readFileSync(
    `${__dirname}/templates/template-overview.html`,
    'utf-8'
);
const tempCard = fs.readFileSync(
    `${__dirname}/templates/template-card.html`,
    'utf-8'
);
const tempProduct = fs.readFileSync(
    `${__dirname}/templates/template-product.html`,
    'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// Создание slug-ов
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
    //console.log(res);

    console.log(req.url);
    //console.log(url.parse(req.url, true));

    const { query, pathname } = url.parse(req.url, true);

    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const cardsHtml = dataObj
            .map((el) => replaceTemplate(tempCard, el))
            .join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

        res.end(output);

        // Product page
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);

        res.end(output);

        // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);

        // Not found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world',
        });
        res.end('<h1>This page can not be found</h1>');
    }
    res.end('Hello from the server!');
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to request at port 8000');
});
