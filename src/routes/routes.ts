import * as PedidosControllers from "../controllers/Pedidos"
import { Request, Response } from "express"
import express from "express";

const routes = express.Router();

// GET
// POST
// PUT 
// PATCH 
// DELETE

routes.post('/pedido', PedidosControllers.prePedido)
routes.post('/pedido/offline', PedidosControllers.postPedidosOffline)
routes.get('/transmitir/pedidos', PedidosControllers.transmitirPedidos)
routes.get('/ping', (req: Request, res: Response) => {
  return res.json('pong')
})




export default routes;