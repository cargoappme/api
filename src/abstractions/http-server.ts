export interface IHttpServer {
  listen (ip: string, port: number): Promise<void>
}
