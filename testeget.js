const { response } = require('express');
const express = require ('express')
const app = express();
app.use(express.json());

app.get('/status',(request,response)=>{
    return response.json({message : 'servidor esta rodando'})
})

app.post('/teste',(request,response)=>{
    const {name,date} = request.body;

    return response.json({name,date})
})


app.listen(3333)