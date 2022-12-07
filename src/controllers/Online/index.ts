import { PrismaClient } from "@prisma/client";
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

  await bot.telegram.editMessageText(chatId, message_id, undefined,
    `<pre>                     MATRIZ               </pre>
    ${vendedores.filter(({cod_vend}) => Number(cod_vend) <= 300).map((each) => {
      return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(20, ' ')} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }) : '       ❌       '}</pre>`
    }).join('\n')}
    <pre>                     FILIAL               </pre>
    ${vendedores.filter(({cod_vend}) => Number(cod_vend) >= 300).map((each) => {
      return `<pre> &#8226; ${each.cod_vend} - ${each.nome_vend.padEnd(20, ' ')} - ${each.ultimo_log !== null ? new Date(each.ultimo_log).toLocaleString("pt-br", { timeZone: 'America/Bahia' }).padStart(5, ' ') : '       ❌       '}</pre>`
    }).join('\n')}
    `
   , { parse_mode: 'HTML' })

  return res.json('vendedores')
}
