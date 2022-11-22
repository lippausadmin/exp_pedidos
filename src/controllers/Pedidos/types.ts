export type PedidoItensProps = {
  acaoQtdAutorizada: number;
  bonusGerado: number;
  bonusUtilizado: number;
  carga: string;
  codigoCompletoTabela: string;
  codigoOcorrencia: string;
  codigoProduto: string;
  codigoTabelaPreco: string;
  codigoVendedor: string;
  dia: string;
  faixaBandaOrigem: string;
  flagDev: boolean;
  horaInicialPedido: string;
  itemAlteradoBandaPreco: number;
  itemCancelado: boolean;
  itemOrigemAcaoMercado: boolean;
  itemOrigemAcaoSolavanco: number;
  itemValidadoBonificaoAutomatica: boolean;
  numeroCliente: string;
  percDesconto: number;
  perfilTabela: string;
  permiteAlterarQtdBonificada: boolean;
  possuiRegraHeishop: boolean;
  precoNegociado: boolean;
  precoUn: number;
  qtdeAvulsa: number;
  qtdeCaixa: number;
  regiaoCliente: string;
  tipoRecolhimento: string;
  valorAcrescimoCapa: number;
  valorBonificado: number;
  valorBruto: number;
  valorDescontoCapa: number;
  valorDescontoItem: number;
  valorImpostoBarreira: number;
  valorIpi: number;
  valorLiquido: number;
  valorLiquidoFinal: number;
  valorLiquidoUmAvulso: number;
  valorLiquidoUmaCaixa: number;
  valorVerba: number;
  valorVerbaUtilizadaGL: number;

  produtos?: any[]
};

export type PedidoProps = {
  bonusUtilizado: number;
  carga: string;
  chaveMobiltec: string;
  codigoCliente: string;
  codigoCondicaoPagamento: string | null;
  codigoErpTerceiro: string;
  codigoMotivoNaoCompra: any;
  codigoTipoCobranca: string | null;
  codigoVendedor: string;
  coordGpsForaArea: boolean;
  cpfCnpj: string;
  dataEmissao: string;
  dataHoraUltimaEdicao: string;
  desbloqueioGPSERP: boolean;
  dia: string;
  distanciaGPS: string;
  duracaoPedido: number;
  gpsLatitude: string;
  gpsLongitude: string;
  horaFinalPedido: string;
  horaFinalPedidoTZ: string;
  horaInicialPedido: string;
  horaInicialPedidoTZ: string;
  imediato: boolean;
  intervaloSincronismo: number;
  itens: PedidoItensProps[];
  licenca: string;
  numeroCliente: string;
  numeroPedidoDigitado: string;
  numeroPrePedido: string;
  observacao: string;
  observacaoCarregamento: string;
  observacaoNF: string;
  observacaoRecebimento: string;
  organizacaoVendas: string;
  pedidoAberto: boolean;
  pedidoBloqueado: boolean;
  pedidoHeishop: boolean;
  pedidoRecolhimento: boolean;
  pedidoTransmitido: boolean;
  percDesconto: number;
  percTaxaFinanc: number;
  qtdSatelites: number;
  qtdeAvulsa: number;
  qtdeCaixa: number;
  regiaoCliente: string;
  rota: string;
  statusControleERP: string;
  statusPedidoHeishop: string;
  tecnologiaUtiliz: string;
  tipoEntrega: number;
  transmitidoFirebase: number;
  transmitirMobiltec: number;
  transmitirPortal: number;
  urlMobiltec: string;
  urlPortal: string;
  valorBonificado: number;
  valorBruto: number;
  valorDesconto: number;
  valorFinal: number;
  valorImpostoBarreira: number;
  valorIpi: number;
  valorLiquido: number;
  valorVerba: number;
  valorVerbaGeradaGL: number;
  valorVerbaUtilizadaGL: number;
  dataEntrega: string | null;
};

export type CarrinhoOcorrenciaProps = {
  exibir_oco: number;
  clientes_todos: number;
  nome_oco: string;
  cod_oco: number;
};

export type CarrinhoProps = {
  preco_prod: number;
  imagem: string;
  sequencia?: number;
  qtde_prod: number;
  cod_linha: number;
  cod_tipo: number;
  cod_segmento: number;
  descricao_prod: string;
  status_prod: number;
  cod_fam: string;
  num_tabela: number;
  cod_embalagem: number;
  cod_categoria: number;
  cod_marca: number;
  cod_prod: number;
  ocorrencia: CarrinhoOcorrenciaProps;
  quantidadeCaixa: number;
  quantidadeAvulsa: number;



  cod_combo?: number;
  cod_motivo_bon?: number;
  cod_ocorrencia?: number;
  desc_combo?: string;
  desc_max?: number;
  prod_variavel?: number;
  qtde_cx?: number;
  qtde_un?: number;
  tipo_combo?: string;
};

export type CarrinhoProdutoComboProps = {
  venda_adicional: any;
  tabela_promocional: any;
  cod_categoria: number;

  cod_embalagem: number;
  cod_fam: string;
  cod_linha: number;
  cod_marca: number;
  cod_motivo_bon: number;
  cod_ocorrencia: number;
  cod_prod: number;
  cod_segmento: number;
  cod_tipo: number;

  desc_max: number;
  descricao_prod: string;
  imagem: string;
  num_tabela: number;
  preco_prod: number;
  prod_variavel: number;
  qtde_cx: number;
  qtde_prod: number;
  qtde_un: number;
  quantidadeCaixa: number;
  quantidadeAvulsa: number;
  status_prod: number;

  desc_combo: string;
  cod_combo: number;
  tipo_combo: string;
}

export type CarrinhoComboProps = {
  cod_combo: number;
  desc_combo: string;
  imagem_combo: string;
  quantidade: number;
  tipo_combo: string;
  total_combo: number;
  produtos: PedidoItensProps[]
}

export type ClienteProps = {
  cpf_cnpj_cli: any;
  motivo_nao_compra: any;
  bairro_cli: string;
  cidade_cli: string;
  cod_canal: string;
  cod_cli: string;
  cond_pag: string;
  desc_canal: string;
  devendo: number;
  dt_inc_cli: string;
  fantasia_cli: string;
  inicio_atendimento: string;
  final_atendimento: string;
  data_entrega: string;
  lat_cli: number;
  limite_credito_disponivel: number;
  long_cli: number;
  matriz_cli: string;
  merc_cli: string;
  num_seq_qz1: number;
  num_seq_qz2: number;
  pasta_cli: number;
  razao_cli: string;
  sup_cli: number;
  tel_cli: number;
  tipo_cli: string;
  ultimo_pedido: string;
  vend_cli: number;
  lat_vend: number;
  long_vend: number;
  fora_rota: boolean;
};

export type CondPagProps = {
  cod_pag: string;
  desc_pagamento: string;
  exibir_cond_pag: number;
  taxa_adf: number;
  valor_min: number;
};

export type PromiseReturnTypes = {
  frase: string;
  num_pedido: string;
  boolean: boolean;
}

export type EnviarPedidosProps = {
  num_pedido?: string;
  data_emissao?: string;
  cod_cli?: string;
  cod_pag?: string | null;
  vend_cli?: number;
  inicio_atendimento?: string;
  final_atendimento?: string;
  data_entrega?: string;
  lat_cli?: number;
  long_cli?: number;
  lat_vend?: number;
  long_vend?: number;
  motivo_nao_compra?: string;
  pedido_fora_rota?: boolean;
};

export type EnviarPedidosItensProps = {
  id: string;
  seq_item: number;
  cod_prod: number;
  cod_ocorrencia: number;
  qtde_cx: number;
  qtde_unit: number;
  qtde_prod: number;
  tab_preco_item: number;
  preco_item: number;
  desconto_preco: number;
  valor_total_item: number;

  desc_combo?: string;
  cod_combo?: number;
  tipo_combo?: string;
};
