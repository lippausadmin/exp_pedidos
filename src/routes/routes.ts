import * as PedidosControllers from "../controllers/Pedidos"
import * as OnlineControllers from "../controllers/Online"
import { Request, Response } from "express"
import express from "express";
import { atualizarLog } from "../middleware/Atualizar Log";

const routes = express.Router();

// GET
// POST
// PUT 
// PATCH 
// DELETE

routes.post('/pedido', atualizarLog, PedidosControllers.prePedido)
routes.post('/pedido/offline', atualizarLog, PedidosControllers.postPedidosOffline)
routes.get('/transmitir/pedidos', PedidosControllers.transmitirPedidos)

routes.get('/vendedores/online', OnlineControllers.atulizarVendedoresOnline)


export default routes;