/**
 * Generic Use Case Interface
 * All use cases should implement this contract
 */
export interface IUseCase<IRequest, IResponse> {
  execute(request: IRequest): Promise<IResponse> | IResponse;
}
