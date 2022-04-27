const makeWaSocket = require('@adiwajshing/baileys').default
const { delay, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const P = require('pino')
const { unlink, existsSync, mkdirSync } = require('fs')
const ZDGPath = './ZDGSessions/'
const ZDGAuth = 'auth_info.json'
const express = require('express');
const {WebhookClient} = require('@google-cloud/dialogflow');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();

//webhook dialogflow
app.post('/webhook', function(request,response){
    const agent = new WebhookClient ({ request, response });
        let intentMap = new Map();
        intentMap.set('nomedaintencao', nomedafuncao)
        agent.handleRequest(intentMap);
        });
  function nomedafuncao (agent) {
  }

const sessionClient = new dialogflow.SessionsClient({keyFilename: "iptv-c9pn-52437d9224f8.json"});

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
           console.log(" print pra ver",intentResponse.queryResult.fulfillmentText);
           return `${intentResponse.queryResult.fulfillmentText}`
       } catch (error) {
           console.log(error);
       }
   }
}

const ZDGGroupCheck = (jid) => {
   const regexp = new RegExp(/^\d{18}@g.us$/)
   return regexp.test(jid)
}

const ZDGUpdate = (ZDGsock) => {
   ZDGsock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr){
         console.log('© BOT-ZDG - Qrcode: ', qr);
      };
      if (connection === 'close') {
         const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
         if (ZDGReconnect) ZDGConnection()
         console.log(`© BOT-ZDG - CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString());
         if (ZDGReconnect === false) {
            const removeAuth = ZDGPath + ZDGAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }
      if (connection === 'open'){
         console.log('© BOT-ZDG - CONECTADO')
      }
   })
}

const ZDGConnection = async () => {
   const { version } = await fetchLatestBaileysVersion()
   if (!existsSync(ZDGPath)) {
      mkdirSync(ZDGPath, { recursive: true });
   }
   const { saveState, state } = useSingleFileAuthState(ZDGPath + ZDGAuth)
   const config = {
      auth: state,
      logger: P({ level: 'error' }),
      printQRInTerminal: true,
      version,
      connectTimeoutMs: 60_000,
      async getMessage(key) {
         return { conversation: 'botzg' };
      },
   }
   const ZDGsock = makeWaSocket(config);
   ZDGUpdate(ZDGsock.ev);
   ZDGsock.ev.on('creds.update', saveState);

   const ZDGSendMessage = async (jid, msg) => {
      await ZDGsock.presenceSubscribe(jid)
      await delay(2000)
      await ZDGsock.sendPresenceUpdate('composing', jid)
      await delay(1500)
      await ZDGsock.sendPresenceUpdate('paused', jid)
      
      return await ZDGsock.sendMessage(jid, msg)
   }

   ZDGsock.ev.on('messages.upsert', async ({ messages, type }) => {
   const msg = messages[0]
   const jid = msg.key.remoteJid
   
      if (!ZDGGroupCheck(jid) && !msg.key.fromMe && jid !== 'status@broadcast') {
         console.log("© BOT-ZDG - MENSAGEM : ", msg)
         // ZDGsock.sendReadReceipt(jid, msg.key.participant, [msg.key.id]) 
         let textoResposta = await executeQueries("iptv-c9pn", jid, [JSON.stringify(msg.message.conversation)], 'pt-BR');
         
         
            console.log('mensagem recebida ',textoResposta)


            if (textoResposta === ''  ) {
               console.log('sem resposta')
            }
            else{
               console.log('mensagem recebida ')

               if (textoResposta.includes('|')){
               const args = textoResposta.split(' | ');
               const link1 = args[0];
               const link2 = args[1];
               const link3 = args[2];
               const link4 = args[3];
               console.log (link1 + link2 + link3 + link4)

               const buttons = [
                  { buttonId: 'id1', buttonText: { displayText: link2 }, type: 1 },
                  { buttonId: 'id2', buttonText: { displayText: link3 }, type: 1 },
                  // { buttonId: id3, buttonText: { displayText: displaytext3 }, type: 1 },
               ]
               const buttonsMessage = {
                  text: link1,
                  // footer: 'Escolha uma opção',
                  buttons: buttons,
                  headerType: 1
               }

            await ZDGSendMessage(jid, buttonsMessage)
               .then(result => console.log('RESULT ZDG: ', result))
               .catch(err => console.log('ERRO ZDG: ', err))}


            else{
               console.log('mensagem recebida ')
               await ZDGSendMessage(jid, {text: textoResposta})
               .then(result => console.log('RESULT ZDG: ', result))
               .catch(err => console.log('ERRO ZDG: ', err))


               }
         }}
   })
}

ZDGConnection()


 