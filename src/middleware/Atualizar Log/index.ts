import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";



var prisma = new PrismaClient();

export async function atualizarLog(req: Request, res: Response, next: NextFunction){

  const { vend_cli } = req.query

  try{
    if(!!vend_cli){
      const vendedores = await prisma.vendedores.update({
        where: {
          cod_vend: Number(vend_cli)
        },
        data: {
          ultimo_log: new Date().toISOString()
        }
      })
    }
    
    next()
  }
  catch(err){
    next()
  }


}