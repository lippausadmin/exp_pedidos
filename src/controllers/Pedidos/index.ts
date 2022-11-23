import {
  EnviarPedidosProps,
  EnviarPedidosItensProps,
  PedidoProps,
  PedidoItensProps,
  ClienteProps,
  CondPagProps,
  CarrinhoProdutoComboProps,
} from "./types";
import { differenceInSeconds, getDay } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import control from "../../services/api";
import { Telegraf } from "telegraf";

var prisma = new PrismaClient();

var botToken = process.env.BOT_TOKEN ? process.env.BOT_TOKEN : "";

var bot = new Telegraf(botToken);

var chatId = process.env.CHAT_ID ? process.env.CHAT_ID : "";

function calcularRaio(cliente: any) {
  const { lat_vend, long_vend, lat_cli, long_cli } = cliente;

  const R = 6371e3;
  const φ1 = (lat_cli * Math.PI) / 180;
  const φ2 = (lat_vend * Math.PI) / 180;
  const Δφ = ((lat_vend - lat_cli) * Math.PI) / 180;
  const Δλ = ((long_vend - long_cli) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  return d;
}

function getCodigoTabela(produto: any) {
  if (!!produto.venda_adicional || !!produto.tabela_promocional) {
    return "20220299";
  } else if (!!produto.desc_combo) {
    return "20220399";
  } else {
    return "20220199";
  }
}

function getBusinessDatesCount(endDate: any, startDate: any) {
  let count = 0;
  const curDate = startDate;
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

async function enviarPedido(pedido: EnviarPedidosProps | any, itens: any) {
  const chatId = process.env.CHAT_ID ? process.env.CHAT_ID : "";

  const promiseReturn: any[] = [];

  console.log("ENTROU");

  if (pedido.vend_cli == 111 || pedido.vend_cli == 161) {
    return;
  } else if (
    getBusinessDatesCount(new Date(pedido.data_entrega), new Date()) <= 1 ||
    pedido.data_entrega == null
  ) {
    console.log("pedido para o próximo dia útil");

    // \/ COLOCAR TRUE QUANDO A API ESTIVER EM SENDO UTILIZADA PRA ENVIAR PEDIDOS A CONTROL

    if (true) {
      const itensBase: any[] = itens.map((produto: EnviarPedidosItensProps) => {
        return {
          acaoQtdAutorizada: 0,
          bonusGerado: 0,
          bonusUtilizado: 0,
          carga: "1",
          // codigoCompletoTabela: !!produto.desc_combo ? '20229999' : '20220099' ,
          codigoCompletoTabela: getCodigoTabela(produto),
          codigoOcorrencia: produto.cod_ocorrencia.toString().padStart(3, "0"),
          codigoProduto: produto.cod_prod.toString().padStart(10, "0"),
          codigoTabelaPreco: "99",
          codigoVendedor: pedido.vend_cli.toString().padStart(8, "0"),
          // codigoVendedor: `00000R${cliente.vend_cli}`,
          dia: getDay(new Date(pedido.final_atendimento)).toString(),
          faixaBandaOrigem: "",
          flagDev: false,
          horaInicialPedido: pedido.inicio_atendimento
            .replace(/[-:.TZ]/g, "")
            .substring(0, 14),
          itemAlteradoBandaPreco: 0,
          itemCancelado: false,

          itemOrigemAcaoMercado: false,
          itemOrigemAcaoSolavanco: 0,
          itemValidadoBonificaoAutomatica: false,
          numeroCliente: pedido.cod_cli.substring(5, 9),
          percDesconto: 0,
          perfilTabela: "",
          permiteAlterarQtdBonificada: false,
          possuiRegraHeishop: false,
          precoNegociado: false,
          precoUn: Number(produto.preco_item.toFixed(6)),
          qtdeAvulsa: produto.qtde_unit,
          qtdeCaixa: produto.qtde_cx,

          regiaoCliente: pedido.cod_cli.substring(0, 4),
          tipoRecolhimento: "",
          valorAcrescimoCapa: 0,
          valorBonificado: 0,
          valorBruto:
            Number(produto.preco_item) * produto.qtde_unit +
            Number(produto.preco_item) *
              Number(produto.qtde_prod) *
              produto.qtde_cx,
          valorDescontoCapa: 0,
          valorDescontoItem: 0,
          valorImpostoBarreira: 0,
          valorIpi: 0,
          valorLiquido:
            Number(produto.preco_item) * produto.qtde_unit +
            Number(produto.preco_item) *
              Number(produto.qtde_prod) *
              produto.qtde_cx,
          valorLiquidoFinal:
            Number(produto.preco_item) * produto.qtde_unit +
            Number(produto.preco_item) *
              Number(produto.qtde_prod) *
              produto.qtde_cx,
          valorLiquidoUmAvulso: Number(produto.preco_item.toFixed(6)),
          valorLiquidoUmaCaixa: Number(produto.preco_item) * produto.qtde_prod,
          valorVerba: 0,
          valorVerbaUtilizadaGL: 0,
        };
      });

      const pedidoBase: PedidoProps = {
        bonusUtilizado: 0,
        carga: new Date(pedido.final_atendimento).getMilliseconds().toString(),
        // carga: '567',
        chaveMobiltec: `${
          pedido.vend_cli.toString()[0] == "3" ? "3601" : "2016"
        }-${pedido.vend_cli.toString().padStart(8, "0")}-20221015175714620`,
        // chaveMobiltec: "2016-00000111-20221015175714620",
        codigoCliente: pedido.cod_cli.replace("-", ""), // string sem ' - '
        // codigoCliente: "00019812", ^^
        codigoCondicaoPagamento: pedido.cod_pag.substring(2, 4), // string
        // codigoCondicaoPagamento: "77", ^^
        codigoErpTerceiro: "",
        codigoMotivoNaoCompra:
          pedido.motivo_nao_compra == "Z" ? "S" : pedido.motivo_nao_compra,
        codigoTipoCobranca: pedido.cod_pag.substring(0, 1),
        codigoVendedor: pedido.vend_cli.toString().padStart(8, "0"), // string 8 length
        // codigoVendedor: "00000111", ^^
        coordGpsForaArea: false,
        cpfCnpj: !!pedido.cpf_cnpj_cli
          ? pedido.cpf_cnpj_cli.substring(2, 99)
          : "41952551000999",

        // CLIENTE ^^^

        dataEmissao: new Date(new Date().toUTCString())
          .toISOString()
          .replace(/[-:.TZ]/g, "")
          .substring(0, 14),
        // dataEmissao: "20221017000000",
        dataEntrega: !!pedido.data_entrega
          ? pedido.data_entrega.replaceAll("-", "")
          : null,
        dataHoraUltimaEdicao: pedido.final_atendimento
          .replace("T", " ")
          .substring(0, 19),
        // dataHoraUltimaEdicao: "2022-10-17 09:38:40",
        desbloqueioGPSERP: false,
        dia: getDay(new Date(pedido.final_atendimento)).toString(),
        distanciaGPS: calcularRaio(pedido).toFixed(0),
        // distanciaGPS: 11684, calcular distancia do vendedor até o cliente
        duracaoPedido: differenceInSeconds(
          new Date(pedido.final_atendimento),
          new Date(pedido.inicio_atendimento)
        ),
        gpsLatitude: pedido.lat_vend.toString(),
        // gpsLatitude: "-20.3321354",
        gpsLongitude: pedido.long_vend.toString(),
        // gpsLongitude: "-40.4011105",
        horaFinalPedido: pedido.final_atendimento
          .replace(/[-:.TZ]/g, "")
          .substring(0, 14),
        // horaFinalPedido: "20221017093837",
        horaFinalPedidoTZ: "-03:00",
        horaInicialPedido: pedido.inicio_atendimento
          .replace(/[-:.TZ]/g, "")
          .substring(0, 14),
        // horaInicialPedido: "20221017093718",
        horaInicialPedidoTZ: "-03:00",
        imediato: false,
        intervaloSincronismo: 0,

        itens: itensBase.flat(),

        licenca: pedido.vend_cli.toString()[0] == "3" ? "3601" : "2016",
        numeroCliente: pedido.cod_cli.substring(5, 10),
        numeroPedidoDigitado: "",
        numeroPrePedido: "",
        observacao: "",
        observacaoCarregamento: "",
        observacaoNF: "",
        observacaoRecebimento: "",
        organizacaoVendas: "",
        pedidoAberto: false,
        pedidoBloqueado: false,
        pedidoHeishop: false,
        pedidoRecolhimento: false,
        pedidoTransmitido: true,
        percDesconto: 0,
        percTaxaFinanc: 0,
        qtdSatelites: 0,
        qtdeAvulsa: itensBase
          .flat()
          .reduce(
            (prev: number, curr: PedidoItensProps) => prev + curr.qtdeAvulsa,
            0
          ),
        qtdeCaixa: itensBase
          .flat()
          .reduce(
            (prev: number, curr: PedidoItensProps) => prev + curr.qtdeCaixa,
            0
          ),
        regiaoCliente: pedido.cod_cli.substring(0, 4),
        rota: "01",
        statusControleERP: "",
        statusPedidoHeishop: "",
        tecnologiaUtiliz: "",
        tipoEntrega: 0,
        transmitidoFirebase: 3,
        transmitirMobiltec: 1,
        transmitirPortal: 2,
        urlMobiltec: "",
        urlPortal: "",
        valorBonificado: 0,
        valorBruto: itensBase
          .flat()
          .reduce(
            (prev: number, curr: PedidoItensProps) =>
              prev + curr.valorLiquidoFinal,
            0
          ),
        valorDesconto: 0,
        valorFinal: itensBase
          .flat()
          .reduce(
            (prev: number, curr: PedidoItensProps) =>
              prev + curr.valorLiquidoFinal,
            0
          ),
        valorImpostoBarreira: 0,
        valorIpi: 0,
        valorLiquido: itensBase
          .flat()
          .reduce(
            (prev: number, curr: PedidoItensProps) =>
              prev + curr.valorLiquidoFinal,
            0
          ),
        valorVerba: 0,
        valorVerbaGeradaGL: 0,
        valorVerbaUtilizadaGL: 0,
      };

      const fetch = await control.post("/sfa/sinaliza/pedido", pedidoBase);

      console.log(fetch.data);

      promiseReturn.push({
        frase: fetch.data.pedidos[0].retornoTransmissaoWebService,
        num_pedido: pedido.num_pedido,
        boolean:
          fetch.data.pedidos[0].retornoTransmissaoWebService ==
          "Pedido transmitido com sucesso",
      });

      const updatePedido = await prisma.pedidos_capa.updateMany({
        data: {
          transmitido: true,
          horario_transmissao: new Date().toISOString(),
        },
        where: {
          num_pedido: {
            in: promiseReturn
              .filter((each: any) => each.boolean == true)
              .map((each: any) => each.num_pedido),
          },
        },
      });

      if (
        promiseReturn.filter((each: any) => each.boolean == false).length > 0
      ) {
        try {
          const resposta = promiseReturn
            .filter((each: any) => each.boolean == false)
            .map((pedido) => {
              return `NUM_PEDIDO: ${pedido.num_pedido} \nMOTIVO: ${pedido.frase}\n`;
            })
            .join("\n");

          await bot.telegram.sendMessage(
            chatId,
            `
              PEDIDOS NÃO ENVIADOS: \n\n${resposta}
            `
          );
        } catch (err) {
          console.log(err);
        }
      }

      // BOT ^^^^
    }
  } else {
    console.log("entrega futura, só salva no banco e envia dps");
  }

  return { promiseReturn, pedido };
}

export async function prePedido(req: Request, res: Response) {
  const chatId = process.env.CHAT_ID ? process.env.CHAT_ID : "";

  // FUNÇÃO PARA TRANSMITIR PEDIDOS DO EXP PARA O NOSSO DB

  const carrinho: any[] = req.body.carrinho;

  const cliente: ClienteProps = req.body.cliente;

  const motivo_nao_compra = req.body.motivo_nao_compra;

  const cond_pag: CondPagProps = req.body.cond_pag;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let counter = 0;

  const itens = !!carrinho
    ? carrinho.map((each: any) => {
        if (each.produtos !== undefined) {
          return each.produtos.map((produto: CarrinhoProdutoComboProps) => {
            if (produto.quantidadeAvulsa == null) {
              produto.quantidadeAvulsa = 0;
            }

            counter++;

            return {
              id: `${counter}-${cliente.cod_cli}/${cliente.final_atendimento
                .replace(/[-:.TZ]/g, "")
                .substring(0, 12)}`,
              seq_item: 0,
              cod_prod: produto.cod_prod,
              cod_ocorrencia: produto.cod_ocorrencia,
              qtde_cx: produto.quantidadeCaixa,
              qtde_unit: produto.quantidadeAvulsa,
              qtde_prod: produto.qtde_prod,
              tab_preco_item: produto.num_tabela,
              preco_item: Number(produto.preco_prod / produto.qtde_prod),
              valor_total_item:
                (Number(produto.preco_prod) / Number(produto.qtde_prod)) *
                  produto.quantidadeAvulsa +
                Number(produto.preco_prod) * produto.quantidadeCaixa,
              desconto_preco: 0,
              cod_combo: produto.cod_combo,
              desc_combo: produto.desc_combo,
              tipo_combo: produto.tipo_combo,
              tabela_promocional: Boolean(produto.tabela_promocional),
              venda_adicional: Boolean(produto.venda_adicional),
            };
          });
        } else {
          counter++;

          return {
            id: `${counter}-${cliente.cod_cli}/${cliente.final_atendimento
              .replace(/[-:.TZ]/g, "")
              .substring(0, 12)}`,
            seq_item: 0,
            cod_prod: each.cod_prod,
            cod_ocorrencia: each.cod_ocorrencia,
            qtde_cx: each.quantidadeCaixa,
            qtde_unit: each.quantidadeAvulsa,
            qtde_prod: each.qtde_prod,
            tab_preco_item: each.num_tabela,
            preco_item: Number(each.preco_prod / each.qtde_prod),
            desconto_preco: 0,
            valor_total_item:
              (Number(each.preco_prod) / Number(each.qtde_prod)) *
                each.quantidadeAvulsa +
              Number(each.preco_prod) * each.quantidadeCaixa,
            tabela_promocional: Boolean(each.tabela_promocional),
            venda_adicional: Boolean(each.venda_adicional),
          };
        }
      })
    : [];

  // ITENS DO CARRINHO SÃO PADRONIZADOS PARA O pedidos_itens ^^

  const data = {
    num_pedido: `${cliente.cod_cli}/${cliente.final_atendimento
      .replace(/[-:.TZ]/g, "")
      .substring(0, 12)}`,
    data_emissao: new Date().toISOString(),
    cod_cli: cliente.cod_cli,
    cod_pag: !!cond_pag ? cond_pag.cod_pag : cliente.cond_pag,
    vend_cli: cliente.vend_cli,
    inicio_atendimento: cliente.inicio_atendimento,
    final_atendimento: cliente.final_atendimento,
    data_entrega: cliente.data_entrega,
    lat_cli: cliente.lat_cli,
    long_cli: cliente.long_cli,
    lat_vend: cliente.lat_vend,
    long_vend: cliente.long_vend,
    motivo_nao_compra: !!motivo_nao_compra ? motivo_nao_compra : "Z",
    pedido_fora_rota: cliente.fora_rota,
    cpf_cnpj_cli: cliente.cpf_cnpj_cli,
  };

  const pedido = await prisma.pedidos_capa.create({
    data: {
      ...data,
      itens: {
        createMany: {
          data: itens.flat(),
        },
      },
    },
  });

  // OS DADOS SÃO ESCRITOS NO pedidos_capa E pedidos_itens AO MESMO TEMPO ^^

  const momento_atual = new Date().toISOString().substring(11, 19);

  if (momento_atual < "10:30:00" || momento_atual > "20:36:00") {
    // ^^ TEM QUE SOMAR 3 HORAS, ESSE HORÁRIO É O 'GLOBAL'

    // 7:30 até as 17:36

    try {
      await bot.telegram.sendMessage(
        chatId,
        `
          O VENDEDOR ${pedido.vend_cli} TENTOU MANDAR O PEDIDO ${pedido.num_pedido} E FOI BLOQUEADO PELO HORÁRIO ${momento_atual}
        `
      );
    } catch (err) {
      console.log(err);
    }
    return res
      .status(201)
      .json({ retorno_envio: "Pedido salvo no banco mas não enviado", pedido });
  }

  try {
    if (pedido.motivo_nao_compra == "Z") {
      await bot.telegram.sendMessage(
        chatId,
        `VENDEDOR: <b>${pedido.vend_cli}</b>\nPEDIDO: <b>${
          pedido.num_pedido
        }</b>\nDATA: <b>${new Date(pedido.final_atendimento).toLocaleString(
          "pt-br"
        )}</b>\nVALOR TOTAL: <b>${formatter.format(
          itens.flat().reduce((a, b) => a + b.valor_total_item, 0)
        )}</b>\n
        `,
        { parse_mode: "HTML" }
      );
    } else {
      const motivo = await prisma.motivo_nao_compra.findFirst({
        where: {
          cod_motivo: !!pedido.motivo_nao_compra
            ? pedido.motivo_nao_compra
            : "",
        },
      });

      await bot.telegram.sendMessage(
        chatId,
        `VENDEDOR: <b>${pedido.vend_cli}</b>\nPEDIDO: <b>${
          pedido.num_pedido
        }</b>\nDATA: <b>${new Date(pedido.final_atendimento).toLocaleString(
          "pt-br"
        )}</b>\nMOTIVO: <b>${motivo?.descricao_motivo}</b>\n`,
        { parse_mode: "HTML" }
      );
    }
  } catch (err) {
    console.log(err);
  }

  const retorno = await enviarPedido(data, itens.flat());

  // OS PEDIDOS SÃO ENVIADOS DIRETO PRA CONTROL E JÁ SETADO ENVIADO DENTRO DO DB ^^

  console.log({ retorno_envio: retorno, pedido });

  return res.status(200).json({ retorno_envio: retorno, pedido });
}

export async function postPedidosOffline(req: Request, res: Response) {
  const chatId = process.env.CHAT_ID ? process.env.CHAT_ID : "";

  // FUNÇÃO PARA TRANSMITIR PEDIDOS OFF PARA O NOSSO DB

  const pedidos: any[] = req.body.pedidos;

  // ITENS DO CARRINHO SÃO PADRONIZADOS PARA O pedidos_itens ^^

  let dataCapa: EnviarPedidosProps | any[] = pedidos.slice().map((pedido) => {
    return {
      num_pedido: pedido.num_pedido,
      data_emissao: new Date(),
      cod_cli: pedido.cod_cli,
      cod_pag: pedido.cod_pag,
      vend_cli: pedido.vend_cli,
      inicio_atendimento: pedido.inicio_atendimento,
      final_atendimento: pedido.final_atendimento,
      data_entrega: pedido.data_entrega,
      lat_cli: pedido.lat_cli,
      long_cli: pedido.long_cli,
      lat_vend: pedido.lat_vend,
      long_vend: pedido.long_vend,
      pedido_fora_rota: !!pedido.fora_rota,
      motivo_nao_compra: pedido.motivo_nao_compra,
      cpf_cnpj_cli: pedido.cpf_cnpj_cli,
    };
  });

  let dataItens = pedidos.slice().map((pedido: any) => {
    return pedido.itens.map((item: any) => {
      return {
        tabela_promocional: Boolean(item.tabela_promocional),
        venda_adicional: Boolean(item.venda_adicional),
        ...item,
      };
    });
  });

  const capas = await prisma.pedidos_capa.createMany({
    data: dataCapa,
    skipDuplicates: true,
  });

  const itens = await prisma.pedidos_itens.createMany({
    data: dataItens.flat(),
    skipDuplicates: true,
  });

  // OS DADOS SÃO ESCRITOS NO pedidos_capa E pedidos_itens AO MESMO TEMPO ^^

  if (dataCapa.length > 0) {
    try {
      const resposta = dataCapa
        .map((pedido) => {
          return `${pedido.num_pedido}`;
        })
        .join("\n");

      await bot.telegram.sendMessage(
        chatId,
        `O VENDEDOR ${dataCapa[0].vend_cli} MANDOU OS PEDIDOS: \n${resposta} \nVIA OFFLINE`
      );

      // acompanhar pedidos piloto ^^^
    } catch (err) {
      console.log(err);
    }
  }

  const retorno = await Promise.all(
    pedidos.map(async (pedido) => {
      await enviarPedido(pedido, pedido.itens);
    })
  );

  return res.json("pedido");
}

export async function transmitirPedidos(req: Request, res: Response) {
  const chatId = process.env.CHAT_ID ? process.env.CHAT_ID : "";

  const promiseReturn: any[] = [];

  const pedidos = await prisma.pedidos_capa.findMany({
    where: {
      transmitido: false,
      NOT: {
        OR: [
          {
            vend_cli: 111,
          },
          {
            vend_cli: 161,
          },
        ],
      }
    },
    include: {
      itens: true,
    },
  });

  return res.json(pedidos)

  // PEDIDOS QUE NÃO FORAM TRANSMITIDOS SÃO PEGOS DO BANCO ^^

  console.log(pedidos.length);

  console.log("ENTROU");

  const promises = await Promise.all(
    pedidos.map(async (pedido) => {
      let { itens } = pedido;

      if (pedido.vend_cli == 111) {
        return;
      } else if (
        pedido.data_entrega == null ||
        getBusinessDatesCount(new Date(pedido.data_entrega), new Date()) <= 1
      ) {
        console.log("pedido para o próximo dia útil");

        // \/ COLOCAR TRUE QUANDO A API ESTIVER EM SENDO UTILIZADA PRA ENVIAR PEDIDOS A CONTROL

        if (true) {
          const itensBase: any[] = itens.map((produto: any) => {
            return {
              acaoQtdAutorizada: 0,
              bonusGerado: 0,
              bonusUtilizado: 0,
              carga: "1",
              // codigoCompletoTabela: !!produto.desc_combo ? '20229999' : '20220099' ,
              codigoCompletoTabela: getCodigoTabela(produto),
              codigoOcorrencia: produto.cod_ocorrencia
                .toString()
                .padStart(3, "0"),
              codigoProduto: produto.cod_prod.toString().padStart(10, "0"),
              codigoTabelaPreco: "99",
              codigoVendedor: pedido.vend_cli.toString().padStart(8, "0"),
              // codigoVendedor: `00000R${cliente.vend_cli}`,
              dia: getDay(new Date(pedido.final_atendimento)).toString(),
              faixaBandaOrigem: "",
              flagDev: false,
              horaInicialPedido: pedido.inicio_atendimento
                .replace(/[-:.TZ]/g, "")
                .substring(0, 14),
              itemAlteradoBandaPreco: 0,
              itemCancelado: false,

              itemOrigemAcaoMercado: false,
              itemOrigemAcaoSolavanco: 0,
              itemValidadoBonificaoAutomatica: false,
              numeroCliente: pedido.cod_cli.substring(5, 9),
              percDesconto: 0,
              perfilTabela: "",
              permiteAlterarQtdBonificada: false,
              possuiRegraHeishop: false,
              precoNegociado: false,
              precoUn: Number(produto.preco_item.toFixed(6)),
              qtdeAvulsa: produto.qtde_unit,
              qtdeCaixa: produto.qtde_cx,

              regiaoCliente: pedido.cod_cli.substring(0, 4),
              tipoRecolhimento: "",
              valorAcrescimoCapa: 0,
              valorBonificado: 0,
              valorBruto:
                Number(produto.preco_item) * produto.qtde_unit +
                Number(produto.preco_item) *
                  Number(produto.qtde_prod) *
                  produto.qtde_cx,
              valorDescontoCapa: 0,
              valorDescontoItem: 0,
              valorImpostoBarreira: 0,
              valorIpi: 0,
              valorLiquido:
                Number(produto.preco_item) * produto.qtde_unit +
                Number(produto.preco_item) *
                  Number(produto.qtde_prod) *
                  produto.qtde_cx,
              valorLiquidoFinal:
                Number(produto.preco_item) * produto.qtde_unit +
                Number(produto.preco_item) *
                  Number(produto.qtde_prod) *
                  produto.qtde_cx,
              valorLiquidoUmAvulso: Number(produto.preco_item.toFixed(6)),
              valorLiquidoUmaCaixa:
                Number(produto.preco_item) * produto.qtde_prod,
              valorVerba: 0,
              valorVerbaUtilizadaGL: 0,
            };
          });

          const pedidoBase: PedidoProps = {
            bonusUtilizado: 0,
            carga: new Date(pedido.final_atendimento)
              .getMilliseconds()
              .toString(),
            // carga: '567',
            chaveMobiltec: `${
              pedido.vend_cli.toString()[0] == "3" ? "3601" : "2016"
            }-${pedido.vend_cli.toString().padStart(8, "0")}-20221015175714620`,
            // chaveMobiltec: "2016-00000111-20221015175714620",
            codigoCliente: pedido.cod_cli.replace("-", ""), // string sem ' - '
            // codigoCliente: "00019812", ^^
            codigoCondicaoPagamento: pedido.cod_pag.substring(2, 4), // string
            // codigoCondicaoPagamento: "77", ^^
            codigoErpTerceiro: "",
            codigoMotivoNaoCompra:
              pedido.motivo_nao_compra == "Z" ? "S" : pedido.motivo_nao_compra,
            codigoTipoCobranca: pedido.cod_pag.substring(0, 1),
            codigoVendedor: pedido.vend_cli.toString().padStart(8, "0"), // string 8 length
            // codigoVendedor: "00000111", ^^
            coordGpsForaArea: false,
            cpfCnpj: !!pedido.cpf_cnpj_cli
              ? pedido.cpf_cnpj_cli.substring(2, 99)
              : "41952551000999",

            // CLIENTE ^^^

            dataEmissao: new Date(new Date().toUTCString())
              .toISOString()
              .replace(/[-:.TZ]/g, "")
              .substring(0, 14),
            // dataEmissao: "20221017000000",
            dataEntrega: !!pedido.data_entrega
              ? pedido.data_entrega.replaceAll("-", "")
              : null,
            dataHoraUltimaEdicao: pedido.final_atendimento
              .replace("T", " ")
              .substring(0, 19),
            // dataHoraUltimaEdicao: "2022-10-17 09:38:40",
            desbloqueioGPSERP: false,
            dia: getDay(new Date(pedido.final_atendimento)).toString(),
            distanciaGPS: calcularRaio(pedido).toFixed(0),
            // distanciaGPS: 11684, calcular distancia do vendedor até o cliente
            duracaoPedido: differenceInSeconds(
              new Date(pedido.final_atendimento),
              new Date(pedido.inicio_atendimento)
            ),
            gpsLatitude: pedido.lat_vend.toString(),
            // gpsLatitude: "-20.3321354",
            gpsLongitude: pedido.long_vend.toString(),
            // gpsLongitude: "-40.4011105",
            horaFinalPedido: pedido.final_atendimento
              .replace(/[-:.TZ]/g, "")
              .substring(0, 14),
            // horaFinalPedido: "20221017093837",
            horaFinalPedidoTZ: "-03:00",
            horaInicialPedido: pedido.inicio_atendimento
              .replace(/[-:.TZ]/g, "")
              .substring(0, 14),
            // horaInicialPedido: "20221017093718",
            horaInicialPedidoTZ: "-03:00",
            imediato: false,
            intervaloSincronismo: 0,

            itens: itensBase.flat(),

            licenca: pedido.vend_cli.toString()[0] == "3" ? "3601" : "2016",
            numeroCliente: pedido.cod_cli.substring(5, 10),
            numeroPedidoDigitado: "",
            numeroPrePedido: "",
            observacao: "",
            observacaoCarregamento: "",
            observacaoNF: "",
            observacaoRecebimento: "",
            organizacaoVendas: "",
            pedidoAberto: false,
            pedidoBloqueado: false,
            pedidoHeishop: false,
            pedidoRecolhimento: false,
            pedidoTransmitido: true,
            percDesconto: 0,
            percTaxaFinanc: 0,
            qtdSatelites: 0,
            qtdeAvulsa: itensBase
              .flat()
              .reduce(
                (prev: number, curr: PedidoItensProps) =>
                  prev + curr.qtdeAvulsa,
                0
              ),
            qtdeCaixa: itensBase
              .flat()
              .reduce(
                (prev: number, curr: PedidoItensProps) => prev + curr.qtdeCaixa,
                0
              ),
            regiaoCliente: pedido.cod_cli.substring(0, 4),
            rota: "01",
            statusControleERP: "",
            statusPedidoHeishop: "",
            tecnologiaUtiliz: "",
            tipoEntrega: 0,
            transmitidoFirebase: 3,
            transmitirMobiltec: 1,
            transmitirPortal: 2,
            urlMobiltec: "",
            urlPortal: "",
            valorBonificado: 0,
            valorBruto: itensBase
              .flat()
              .reduce(
                (prev: number, curr: PedidoItensProps) =>
                  prev + curr.valorLiquidoFinal,
                0
              ),
            valorDesconto: 0,
            valorFinal: itensBase
              .flat()
              .reduce(
                (prev: number, curr: PedidoItensProps) =>
                  prev + curr.valorLiquidoFinal,
                0
              ),
            valorImpostoBarreira: 0,
            valorIpi: 0,
            valorLiquido: itensBase
              .flat()
              .reduce(
                (prev: number, curr: PedidoItensProps) =>
                  prev + curr.valorLiquidoFinal,
                0
              ),
            valorVerba: 0,
            valorVerbaGeradaGL: 0,
            valorVerbaUtilizadaGL: 0,
          };

          const fetch = await control.post("/sfa/sinaliza/pedido", pedidoBase);

          console.log(fetch.data);

          promiseReturn.push({
            frase: fetch.data.pedidos[0].retornoTransmissaoWebService,
            num_pedido: pedido.num_pedido,
            boolean:
              fetch.data.pedidos[0].retornoTransmissaoWebService ==
              "Pedido transmitido com sucesso",
          });
        }
      } else {
        console.log("entrega futura, só salva no banco e envia dps");
      }
    })
  );

  const updatePedido = await prisma.pedidos_capa.updateMany({
    data: {
      transmitido: true,
      horario_transmissao: new Date().toISOString(),
    },
    where: {
      num_pedido: {
        in: promiseReturn
          .filter((each: any) => each.boolean == true)
          .map((each: any) => each.num_pedido),
      },
    },
  });

  if (promiseReturn.filter((each: any) => each.boolean == false).length > 0) {
    try {
      const resposta = promiseReturn
        .filter((each: any) => each.boolean == false)
        .map((pedido) => {
          return `  &#8226; ${pedido.num_pedido}, ${pedido.frase}\n`;
        })
        .join("\n");

      await bot.telegram.sendMessage(
        chatId,
        `PEDIDOS NÃO ENVIADOS: \n\n${resposta}`,
        {
          parse_mode: "HTML",
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  if (promiseReturn.filter((each: any) => each.boolean == true).length > 0) {
    try {
      const resposta = promiseReturn
        .filter((each: any) => each.boolean == true)
        .map((pedido) => {
          return `  &#8226; ${pedido.num_pedido}\n`;
        })
        .join("\n");

      await bot.telegram.sendMessage(
        chatId,
        `OS PEDIDOS: \n\n${resposta}\nFORAM ENVIADOS COM SUCESSO PELA API`,
        {
          parse_mode: "HTML",
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).json({
    pedidos_enviados: promiseReturn.filter((each: any) => each.boolean == true)
      .length,
    pedidos_travados: promiseReturn.filter((each: any) => each.boolean == false)
      .length,
  });
}
