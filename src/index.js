const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (request, response) => {
    response.send('Hello World');
})

app.post('/mypage', (request, response) => {
    let body = request.body.Body;
    let from = request.body.From;

    console.log(request.body);

    let message =" ";

    if (body.includes("hi")) { message = "hello" }
    else { message = "hi"; }

    response.type('xml');
    response.send(
        `
        <Response>
            <Message>
            ${message}
            </Message>
        </Response>
        `
    )
})

app.listen(3000);