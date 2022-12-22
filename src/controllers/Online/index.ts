import { PrismaClient } from "@prisma/client";
import { isPast, isSameDay, isYesterday } from "date-fns";
import { Request, Response } from "express";
import { Telegraf } from "telegraf";
import ObjectsToCsv from 'objects-to-csv'



var prisma = new PrismaClient();

var message_id = process.env.ONLINE_MESSAGE_ID ? Number(process.env.ONLINE_MESSAGE_ID) : 0;

var botToken = process.env.BOT_ONLINE_TOKEN ? process.env.BOT_ONLINE_TOKEN : "";

var chatId = process.env.ONLINE_CHAT_ID ? process.env.ONLINE_CHAT_ID : "";

var chatCSVId = process.env.ONLINE_CHAT_CSV_ID ? process.env.ONLINE_CHAT_CSV_ID : "";

var bot = new Telegraf(botToken);

export async function atulizarVendedoresOnline(req: Request, res: Response) {

  const vendedores = await prisma.vendedores.findMany({
    orderBy: {
      cod_vend: 'asc'
    }
  })

  try{
    await bot.telegram.editMessageText(chatId, message_id, undefined,
      `<pre>              MATRIZ           PRIMEIRO LOGIN          ULTIMO LOGIN</pre>
      ${vendedores.filter(({cod_vend}) => Number(cod_vend) <= 300).map((each) => {
        return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(18, ' ')} - ${each.primeiro_log !== null ? new Date(each.primeiro_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌                  '} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌'}</pre>`
      }).join('\n')}
      <pre>               FILIAL           PRIMEIRO LOGIN          ULTIMO LOGIN</pre>
      ${vendedores.filter(({cod_vend}) => Number(cod_vend) >= 300).map((each) => {
        return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(18, ' ')} - ${each.primeiro_log !== null ? new Date(each.primeiro_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌                  '} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌'}</pre>`
      }).join('\n')}
      `
     , { parse_mode: 'HTML' })
  }

  catch(err){
    console.log('continua o mesmo')
    return res.json('continua o mesmo')
  }

  return res.json('vendedores')
}

export async function limparLogs(req: Request, res: Response) {

  const vendedores = await prisma.vendedores.updateMany({
    data: {
      ultimo_log: null
    }
  })

  return res.json(vendedores)
}

export async function postLogs(req: Request, res: Response) {

  const { vend_cli } = req.query

  if(Number(vend_cli) == 0){
    console.log('gerente logando')
    
    return res.status(201).json('gerente logando')
  }

  try{
    const log = await prisma.vendedores.findUnique({
      where: {
        cod_vend: !!vend_cli ? Number(vend_cli) : undefined
      },
      select: {
        primeiro_log: true
      }
    })

    if(log?.primeiro_log == null || !isSameDay(new Date(log?.primeiro_log), new Date())){
      await prisma.vendedores.update({
        where: {
          cod_vend: !!vend_cli ? Number(vend_cli) : undefined
        },
        data: {
          primeiro_log: new Date().toISOString()
        }
      })

      console.log('primeiro log')

      return res.json('primeiro log')
    }
  
    await prisma.vendedores.update({
      where: {
        cod_vend: !!vend_cli ? Number(vend_cli) : undefined
      },
      data: {
        ultimo_log: new Date().toISOString()
      }
    })

    console.log('ultimo log')

    return res.json('ultimo log')

  }
  catch(err){}

  return res.json('deu erro, mas passa')

}

export async function getLogsCSV(req: Request, res: Response) {

  const logs = await prisma.vendedores.findMany({
    orderBy: {
      cod_vend: 'asc'
    }
  })

  const data = logs.map((log) => {
    return {
      NOME: log.nome_vend,
      VENDEDOR: Number(log.cod_vend),
      PRIMEIRO_LOGIN: log.primeiro_log,
      ULTIMO_LOGIN: log.ultimo_log
    }
  })

  const time = new Date().toISOString()

  const csv = new ObjectsToCsv(data)

  await csv.toDisk(`/tmp/${time}.csv`);

  await bot.telegram.sendDocument(chatCSVId, {
    filename: `${time.substring(0,10).split('-').reverse().join('/')}.csv`,
    source: `/tmp/${time}.csv`
  })

  return res.json(data)


}
