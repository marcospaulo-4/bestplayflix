const { response } = require('express');
const express = require ('express')
const app = express();

app.use(express.json());
const app2 = express();
app2.use(express.json());


app.get('/status',(request,response)=>{
    return response.json({message : 'servidor esta rodando'})
})

app.post('/teste',(request,response)=>{
    const {name,date} = request.body;

    return response.json({name,date})
})

app2.get('/status',(request,response)=>{
    return response.json({message : 'servidor esta rodando'})
})
app.listen(3333)
app2.listen(3334)