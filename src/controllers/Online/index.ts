import { PrismaClient } from "@prisma/client";
import { isYesterday } from "date-fns";
import { Request, Response } from "express";
import { Telegraf } from "telegraf";



var prisma = new PrismaClient();

var message_id = process.env.ONLINE_MESSAGE_ID ? Number(process.env.ONLINE_MESSAGE_ID) : 0;

var botToken = process.env.BOT_ONLINE_TOKEN ? process.env.BOT_ONLINE_TOKEN : "";

var chatId = process.env.ONLINE_CHAT_ID ? process.env.ONLINE_CHAT_ID : "";

var bot = new Telegraf(botToken);

export async function atulizarVendedoresOnline(req: Request, res: Response) {

  const vendedores = await prisma.vendedores.findMany({
    orderBy: {
      cod_vend: 'asc'
    }
  })

  try{
    await bot.telegram.editMessageText(chatId, message_id, undefined,
      `<pre>                       MATRIZ       </pre>
      ${vendedores.filter(({cod_vend}) => Number(cod_vend) <= 300).map((each) => {
        return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(20, ' ')} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌'}</pre>`
      }).join('\n')}
      <pre>                        FILIAL         </pre>
      ${vendedores.filter(({cod_vend}) => Number(cod_vend) >= 300).map((each) => {
        return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(20, ' ')} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '         ❌'}</pre>`
      }).join('\n')}
      `
     , { parse_mode: 'HTML' })
  }
  catch(err){

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

    if(log?.primeiro_log == null || isYesterday(new Date(log?.primeiro_log))){
      await prisma.vendedores.update({
        where: {
          cod_vend: !!vend_cli ? Number(vend_cli) : undefined
        },
        data: {
          primeiro_log: new Date().toISOString()
        }
      })

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

    return res.json('ultimo log')

  }
  catch(err){}

  return res.json('deu erro, mas passa')

}
