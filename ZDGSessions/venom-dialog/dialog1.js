const venom = require('venom-bot');
const express = require('express');
const http = require('http');
const {WebhookClient} = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

venom
  .create({headless: false})
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

//webhook dialogflow
app.post('/webhook', function(request,response){
    const agent = new WebhookClient ({ request, response });
        let intentMap = new Map();
        intentMap.set('nomedaintencao', nomedafuncao)
        agent.handleRequest(intentMap);
        });
  function nomedafuncao (agent) {
  }

const sessionClient = new dialogflow.SessionsClient({keyFilename: "json.json"});

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };
  
    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }
  
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Pergunta: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Enviando Resposta');
            console.log(intentResponse.queryResult.fulfillmentText);
            return `${intentResponse.queryResult.fulfillmentText}`
        } catch (error) {
            console.log(error);
        }
    }
}

function start(client) {
  client.onMessage(async (msg) => {

    if (msg.type === "chat"){  
        //integração de texto dialogflow
          let textoResposta = await executeQueries("projetoID", msg.from, [msg.body], 'pt-BR');
          const args = textoResposta.split(' | ');
          const link1 = args[0];
          const link2 = args[1];
          const link3 = args[2];
          const link4 = args[3];
          console.log (link1 + link2 + link3 + link4)
          const buttons = [
            {
              "buttonText": {
                "displayText": link3
                }
              },
            {
              "buttonText": {
                "displayText": link4
                }
              }
            ]
          client.sendButtons(msg.from, link1, buttons, link2);
        }
  });
}
server.listen(port, function() {
    console.log('App running on *: ' + port);
  });
  

// ESTRATÉGIA ZAP DAS GALÁXIAS
// ZDG © 2020
// www.zapdasgalaxias.com.br  
