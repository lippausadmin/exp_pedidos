import axios from 'axios'

const control = axios.create({
  baseURL: 'https://lippausdistribuicao.tamosjuntos.com.br/api'
})

export default control